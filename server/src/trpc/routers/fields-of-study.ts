import { TRPCError } from "@trpc/server"
import {
  FieldsOfStudyCreateBodySchema,
  FieldsOfStudyDeleteParamsSchema,
  FieldsOfStudyGetParamsSchema,
  FieldsOfStudyListReqQuerySchema,
  FieldsOfStudyUpdateBodySchema,
  FieldsOfStudyUpdateParamsSchema,
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

export const fieldsOfStudyRouter = createTRPCRouter({
  list: publicProcedure.input(FieldsOfStudyListReqQuerySchema).query(async ({ ctx, input }) => {
    const { id, name, description, notes, sorting } = input
    const offset = input.offset ?? 0
    const limit = input.limit ?? 100

    const whereConditions = {
      ...(id && { id: { contains: id } }),
      ...(name && { name: { contains: name } }),
      ...(description && { description: { contains: description } }),
      ...(notes && { notes: { contains: notes } }),
    }

    const [items, total] = await Promise.all([
      ctx.prisma.fieldOfStudy.findMany({
        include: { course_sets: true },
        where: whereConditions,
        orderBy: getSortings(sorting),
        skip: offset,
        take: limit,
      }),
      ctx.prisma.fieldOfStudy.count({
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

  get: publicProcedure.input(FieldsOfStudyGetParamsSchema).query(async ({ ctx, input }) => {
    const fieldOfStudy = await ctx.prisma.fieldOfStudy.findUnique({
      include: { course_sets: true },
      where: { id: input.id },
    })

    if (!fieldOfStudy) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested field of study was not found.",
      })
    }

    return fieldOfStudy
  }),

  create: protectedProcedure.input(FieldsOfStudyCreateBodySchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const existing = await ctx.prisma.fieldOfStudy.findFirst({
      include: { course_sets: true },
      where: { name: input.name },
    })

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A field of study already exists.",
      })
    }

    return ctx.prisma.fieldOfStudy.create({
      data: input,
      include: { course_sets: true },
    })
  }),

  update: protectedProcedure
    .input(FieldsOfStudyUpdateBodySchema.merge(FieldsOfStudyUpdateParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { id, ...updateData } = input

      return ctx.prisma.fieldOfStudy.update({
        include: { course_sets: true },
        where: { id },
        data: updateData,
      })
    }),

  delete: protectedProcedure.input(FieldsOfStudyDeleteParamsSchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.fieldOfStudy.delete({
      where: { id: input.id },
    })

    return {
      success: true,
    }
  }),
})