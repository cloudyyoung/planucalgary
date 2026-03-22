import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"

import { createTRPCRouter, adminProcedure, publicProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

export const programsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        code: z.string().optional(),
        name: z.string().optional(),
        pid: z.string().optional(),
        is_active: z.coerce.boolean().optional(),
        sorting: z.array(z.string()).optional(),
        offset: z.coerce.number().int().min(0).optional(),
        limit: z.coerce.number().int().min(0).max(5000).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
    const { id, code, name, pid, is_active, sorting } = input
    const offset = input.offset ?? 0
    const limit = input.limit ?? 100

    const whereConditions = {
      ...(id && { id: { contains: id } }),
      ...(code && { code: { contains: code } }),
      ...(name && { name: { contains: name } }),
      ...(pid && { pid: { contains: pid } }),
      ...(is_active !== undefined && { is_active }),
    }

    const [items, total] = await Promise.all([
      ctx.prisma.program.findMany({
        include: {
          faculties: true,
          departments: true,
        },
        where: whereConditions,
        orderBy: [...getSortings(sorting), { is_active: "desc" }, { code: "desc" }],
        skip: offset,
        take: limit,
      }),
      ctx.prisma.program.count({
        where: whereConditions,
      }),
    ])

    return {
      total,
      offset,
      limit,
      has_more: total - (offset + limit) > 0,
      items,
    }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
    const program = await ctx.prisma.program.findUnique({
      include: {
        faculties: true,
        departments: true,
      },
      where: { id: input.id },
    })

    if (!program) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested program was not found.",
      })
    }

    return program
    }),

  create: adminProcedure
    .input(
      z.object({
        program_group_id: z.string(),
        faculties: z.array(z.string()).optional(),
        departments: z.array(z.string()).optional(),
        requisites: z.any().optional(),
        start_term: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const existing = await ctx.prisma.program.findFirst({
      where: { program_group_id: input.program_group_id as string },
    })

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A program already exists.",
      })
    }

    return ctx.prisma.program.create({
      data: {
        ...input,
        faculties: {
          connectOrCreate: input.faculties?.map((code: string) => ({
            where: { code },
            create: { code, name: code, display_name: code, is_active: false },
          })),
        },
        departments: {
          connectOrCreate: input.departments?.map((code: string) => ({
            where: { code },
            create: { code, name: code, display_name: code, is_active: false },
          })),
        },
        requisites: input.requisites as any,
        start_term: input.start_term as any,
      } as any,
    })
    }),

  update: adminProcedure
    .input(
      z
        .object({
          faculties: z.array(z.string()).optional(),
          departments: z.array(z.string()).optional(),
          requisites: z.any().optional(),
          start_term: z.any().optional(),
        })
        .merge(z.object({ id: z.string() }))
    )
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { id, ...updateData } = input as any

      return ctx.prisma.program.update({
        where: { id },
        data: {
          ...updateData,
          faculties: {
            set: [],
            connectOrCreate: updateData.faculties?.map((code: string) => ({
              where: { code },
              create: { code, name: code, display_name: code, is_active: false },
            })),
          },
          departments: {
            set: [],
            connectOrCreate: updateData.departments?.map((code: string) => ({
              where: { code },
              create: { code, name: code, display_name: code, is_active: false },
            })),
          },
          requisites: updateData.requisites as any,
          start_term: updateData.start_term as any,
        },
      })
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.program.delete({
      where: { id: input.id },
    })

    return {
      success: true,
    }
  }),
})