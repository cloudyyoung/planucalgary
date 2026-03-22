import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"
import { paginationInputSchema, resolvePagination } from "../pagination"

import { createTRPCRouter, adminProcedure, publicProcedure } from "../init"

export const fieldsOfStudyRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        sorting: z.array(z.string()).optional(),
      })
      .merge(paginationInputSchema)
    )
    .query(async ({ ctx, input }) => {
    const { id, name, description, notes, sorting } = input
    const { offset, limit } = resolvePagination(input)

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
      items,
    }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
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

  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

  update: adminProcedure
    .input(
      z
        .object({
          name: z.string().optional(),
          description: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
        })
        .merge(z.object({ id: z.string() }))
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      return ctx.prisma.fieldOfStudy.update({
        include: { course_sets: true },
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