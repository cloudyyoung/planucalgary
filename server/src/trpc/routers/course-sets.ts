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

export const courseSetsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          type: z.string().optional(),
          id: z.string().optional(),
          course_set_group_id: z.string().optional(),
          name: z.string().optional(),
          description: z.string().optional(),
          csid: z.string().optional(),
          sorting: z.array(z.string()).optional(),
          offset: z.coerce.number().int().min(0).optional(),
          limit: z.coerce.number().int().min(0).max(5000).optional(),
        })
    )
    .query(async ({ ctx, input }) => {
      const { type, id, course_set_group_id, name, description, csid, sorting } = input
      const offset = input.offset ?? 0
      const limit = input.limit ?? 100

      const whereConditions = {
        ...(id && { id: { contains: id } }),
        ...(type && { type }),
        ...(course_set_group_id && { course_set_group_id: { contains: course_set_group_id } }),
        ...(name && { name: { contains: name } }),
        ...(description && { description: { contains: description } }),
        ...(csid && { csid: { contains: csid } }),
      }

      const [items, total] = await Promise.all([
        ctx.prisma.courseSet.findMany({
          where: whereConditions,
          orderBy: getSortings(sorting),
          skip: offset,
          take: limit,
        }),
        ctx.prisma.courseSet.count({
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
      const courseSet = await ctx.prisma.courseSet.findUnique({
        where: { id: input.id },
      })

      if (!courseSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The requested course set was not found.",
        })
      }

      return courseSet
    }),

  create: authenticatedProcedure
    .input(
      z
        .object({
          course_set_group_id: z.string(),
          raw_json: z.any().optional(),
        })
    )
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const existing = await ctx.prisma.courseSet.findFirst({
        where: { course_set_group_id: input.course_set_group_id },
      })

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A course set already exists.",
        })
      }

      return ctx.prisma.courseSet.create({
        data: {
          ...input,
          raw_json: input.raw_json as any,
        } as any,
      })
    }),

  update: authenticatedProcedure
    .input(z.object({ id: z.string(), raw_json: z.any().optional() }))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { id, ...updateData } = input

      return ctx.prisma.courseSet.update({
        where: { id },
        data: {
          ...updateData,
          raw_json: updateData.raw_json as any,
        },
      })
    }),

  delete: authenticatedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.courseSet.delete({
      where: { id: input.id },
    })

    return {
      success: true,
    }
  }),
})