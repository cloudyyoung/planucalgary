import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"
import { paginationInputSchema, resolvePagination } from "../pagination"

import { createTRPCRouter, adminProcedure, publicProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

export const facultiesRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        display_name: z.string().optional(),
        code: z.string().optional(),
        is_active: z.coerce.boolean().optional(),
        sorting: z.array(z.string()).optional(),
      })
      .merge(paginationInputSchema)
    )
    .query(async ({ ctx, input }) => {
    const { name, display_name, code, is_active, sorting } = input
    const { offset, limit } = resolvePagination(input)

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
      items,
    }
    }),

  get: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
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

  create: adminProcedure
    .input(
      z.object({
        code: z.string(),
        name: z.string(),
        display_name: z.string(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

  update: adminProcedure
    .input(
      z
        .object({
          name: z.string().optional(),
          display_name: z.string().optional(),
          is_active: z.boolean().optional(),
        })
        .merge(z.object({ code: z.string() }))
    )
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { code, ...updateData } = input

      return ctx.prisma.faculty.update({
        where: { code },
        data: updateData,
      })
    }),

  delete: adminProcedure.input(z.object({ code: z.string() })).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.faculty.delete({
      where: { code: input.code },
    })

    return {
      success: true,
    }
  }),
})