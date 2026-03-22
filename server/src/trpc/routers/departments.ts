import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"

import { createTRPCRouter, authenticatedProcedure, publicProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

const DepartmentCodeParamsSchema = z.object({
  code: z.string(),
})

const DepartmentListReqQuerySchema = z
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

const DepartmentCreateBodySchema = z
  .object({
    code: z.string(),
    name: z.string(),
    display_name: z.string(),
    is_active: z.boolean().optional(),
  })
  .loose()

const DepartmentUpdateBodySchema = z.object({}).loose()

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

  get: publicProcedure.input(DepartmentCodeParamsSchema).query(async ({ ctx, input }) => {
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

  create: authenticatedProcedure.input(DepartmentCreateBodySchema).mutation(async ({ ctx, input }) => {
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
      data: {
        ...input,
        is_active: input.is_active ?? false,
      },
    })
  }),

  update: authenticatedProcedure
    .input(DepartmentUpdateBodySchema.merge(DepartmentCodeParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { code, ...updateData } = input

      return ctx.prisma.department.update({
        where: { code },
        data: updateData,
      })
    }),

  delete: authenticatedProcedure.input(DepartmentCodeParamsSchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.department.delete({
      where: { code: input.code },
    })

    return {
      success: true,
    }
  }),
})