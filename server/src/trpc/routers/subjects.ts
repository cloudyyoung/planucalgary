import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"
import { paginationInputSchema, resolvePagination, hasMorePages } from "../pagination"

import { createTRPCRouter, adminProcedure, publicProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

export const subjectsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        code: z.string().optional(),
        title: z.string().optional(),
        sorting: z.array(z.string()).optional(),
      })
      .merge(paginationInputSchema)
    )
    .query(async ({ ctx, input }) => {
    const { id, code, title, sorting } = input
    const { offset, limit } = resolvePagination(input)

    const whereConditions = {
      ...(id && { id: { contains: id } }),
      ...(code && { code: { contains: code } }),
      ...(title && { title: { contains: title } }),
    }

    const [items, total] = await Promise.all([
      ctx.prisma.subject.findMany({
        where: whereConditions,
        orderBy: getSortings(sorting),
        skip: offset,
        take: limit,
      }),
      ctx.prisma.subject.count({
        where: whereConditions,
      }),
    ])

    return {
      total,
      offset,
      limit,
      has_more: hasMorePages(total, offset, limit),
      items,
    }
    }),

  get: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
    const subject = await ctx.prisma.subject.findUnique({
      where: { code: input.code },
    })

    if (!subject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested subject was not found.",
      })
    }

    return subject
    }),

  create: adminProcedure
    .input(
      z.object({
        code: z.string(),
        title: z.string(),
        departments: z.array(z.string()).optional(),
        faculties: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const existing = await ctx.prisma.subject.findFirst({
      where: { code: input.code },
    })

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A subject already exists.",
      })
    }

    return ctx.prisma.subject.create({
      data: {
        ...input,
        departments: {
          connectOrCreate: input.departments?.map((departmentCode: string) => ({
            where: { code: departmentCode },
            create: { code: departmentCode, name: departmentCode, display_name: departmentCode, is_active: false },
          })),
        },
        faculties: {
          connectOrCreate: input.faculties?.map((facultyCode: string) => ({
            where: { code: facultyCode },
            create: { code: facultyCode, name: facultyCode, display_name: facultyCode, is_active: false },
          })),
        },
      },
    })
    }),

  update: adminProcedure
    .input(
      z
        .object({
          title: z.string().optional(),
          departments: z.array(z.string()).optional(),
          faculties: z.array(z.string()).optional(),
        })
        .merge(z.object({ code: z.string() }))
    )
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { code, ...updateData } = input

      return ctx.prisma.subject.update({
        where: { code },
        data: {
          ...updateData,
          departments: {
            connectOrCreate: updateData.departments?.map((departmentCode: string) => ({
              where: { code: departmentCode },
              create: { code: departmentCode, name: departmentCode, display_name: departmentCode, is_active: false },
            })),
          },
          faculties: {
            connectOrCreate: updateData.faculties?.map((facultyCode: string) => ({
              where: { code: facultyCode },
              create: { code: facultyCode, name: facultyCode, display_name: facultyCode, is_active: false },
            })),
          },
        },
      })
    }),

  delete: adminProcedure.input(z.object({ code: z.string() })).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.subject.delete({
      where: { code: input.code },
    })

    return {
      success: true,
    }
  }),
})