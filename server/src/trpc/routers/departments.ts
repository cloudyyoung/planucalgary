import { TRPCError } from "@trpc/server"
import {
  DepartmentCreateBodySchema,
  DepartmentDeleteParamsSchema,
  DepartmentGetParamsSchema,
  DepartmentListReqQuerySchema,
  DepartmentUpdateBodySchema,
  DepartmentUpdateParamsSchema,
  getSortings,
} from "../../contracts"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

export const departmentsRouter = createTRPCRouter({
  list: publicProcedure.input(DepartmentListReqQuerySchema).query(async ({ ctx, input }) => {
    const { name, display_name, code, is_active, sorting } = input
    const offset = input.offset ?? 0
    const limit = input.limit ?? 100

    const whereConditions = { name, display_name, code, is_active }

    const [items, total] = await Promise.all([
      ctx.prisma.department.findMany({
        where: whereConditions,
        orderBy: getSortings(sorting),
        skip: offset,
        take: limit,
      }),
      ctx.prisma.department.count({
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

  get: publicProcedure.input(DepartmentGetParamsSchema).query(async ({ ctx, input }) => {
    const department = await ctx.prisma.department.findUnique({
      where: { code: input.code },
    })

    if (!department) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested department was not found.",
      })
    }

    return department
  }),

  create: protectedProcedure.input(DepartmentCreateBodySchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const existing = await ctx.prisma.department.findFirst({
      where: { code: input.code },
    })

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A department already exists.",
      })
    }

    return ctx.prisma.department.create({
      data: input,
    })
  }),

  update: protectedProcedure
    .input(DepartmentUpdateBodySchema.merge(DepartmentUpdateParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { code, ...updateData } = input

      return ctx.prisma.department.update({
        where: { code },
        data: updateData,
      })
    }),

  delete: protectedProcedure.input(DepartmentDeleteParamsSchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.department.delete({
      where: { code: input.code },
    })

    return {
      success: true,
    }
  }),
})