import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

const FacultyCodeParamsSchema = z.object({
  code: z.string(),
})

const FacultyListReqQuerySchema = z
  .object({
    name: z.string().optional(),
    display_name: z.string().optional(),
    code: z.string().optional(),
    is_active: z.coerce.boolean().optional(),
    sorting: z.array(z.string()).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(0).max(5000).optional(),
  })
  .loose()

const FacultyCreateBodySchema = z
  .object({
    code: z.string(),
    name: z.string(),
    display_name: z.string(),
    is_active: z.boolean().optional(),
  })
  .loose()

const FacultyUpdateBodySchema = z.object({}).loose()

export const facultiesRouter = createTRPCRouter({
  list: publicProcedure.input(FacultyListReqQuerySchema).query(async ({ ctx, input }) => {
    const { name, display_name, code, is_active, sorting } = input
    const offset = input.offset ?? 0
    const limit = input.limit ?? 100

    const whereConditions = {
      ...(name && { name: { contains: name } }),
      ...(display_name && { display_name: { contains: display_name } }),
      ...(code && { code: { contains: code } }),
      ...(is_active !== undefined && { is_active }),
    }

    const [items, total] = await Promise.all([
      ctx.prisma.faculty.findMany({
        where: whereConditions,
        orderBy: getSortings(sorting),
        skip: offset,
        take: limit,
      }),
      ctx.prisma.faculty.count({
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

  get: publicProcedure.input(FacultyCodeParamsSchema).query(async ({ ctx, input }) => {
    const faculty = await ctx.prisma.faculty.findUnique({
      where: { code: input.code },
    })

    if (!faculty) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested faculty was not found.",
      })
    }

    return faculty
  }),

  create: protectedProcedure.input(FacultyCreateBodySchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const existing = await ctx.prisma.faculty.findFirst({
      where: { code: input.code },
    })

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A faculty already exists.",
      })
    }

    return ctx.prisma.faculty.create({
      data: {
        ...input,
        is_active: input.is_active ?? false,
      },
    })
  }),

  update: protectedProcedure
    .input(FacultyUpdateBodySchema.merge(FacultyCodeParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { code, ...updateData } = input

      return ctx.prisma.faculty.update({
        where: { code },
        data: updateData,
      })
    }),

  delete: protectedProcedure.input(FacultyCodeParamsSchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.faculty.delete({
      where: { code: input.code },
    })

    return {
      success: true,
    }
  }),
})