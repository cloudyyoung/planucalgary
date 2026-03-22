import { TRPCError } from "@trpc/server"
import { z } from "zod"
import {
  FacultyCreateBodySchema,
  FacultyListReqQuerySchema,
  FacultyUpdateBodySchema,
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

const FacultyCodeParamsSchema = z.object({
  code: z.string(),
})

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
      data: input,
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