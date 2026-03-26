import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"
import { paginationInputSchema, resolvePagination } from "../pagination"

import { createTRPCRouter, adminProcedure, publicProcedure } from "../init"

const includeCourseSets = {
  requisite_set: {
    include: {
      requisite_rules: {
        include: { referring_course_sets: true },
      },
    },
  },
}

export const fieldsOfStudyRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        sorting: z.array(z.string()).optional(),
      })
      .merge(paginationInputSchema)
    )
    .query(async ({ ctx, input }) => {
    const { id, name, sorting } = input
    const { offset, limit } = resolvePagination(input)

    const whereConditions = {
      ...(id && { id: { contains: id } }),
      ...(name && { name: { contains: name } }),
    }

    const [items, total] = await Promise.all([
      ctx.prisma.fieldOfStudy.findMany({
        include: includeCourseSets,
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
      items,
    }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
    const fieldOfStudy = await ctx.prisma.fieldOfStudy.findUnique({
      include: includeCourseSets,
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

  create: adminProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.fieldOfStudy.findFirst({
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
      include: includeCourseSets,
    })
    }),

  update: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      return ctx.prisma.fieldOfStudy.update({
        include: includeCourseSets,
        where: { id },
        data: updateData,
      })
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.fieldOfStudy.delete({
      where: { id: input.id },
    })

    return {
      success: true,
    }
  }),
})
