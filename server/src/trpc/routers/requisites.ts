import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"
import { paginationInputSchema, resolvePagination } from "../pagination"

import { createTRPCRouter, adminProcedure, publicProcedure } from "../init"

export const requisitesRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        type: z.string().optional(),
        name: z.string().optional(),
        notes: z.string().optional(),
        sorting: z.array(z.string()).optional(),
      })
      .merge(paginationInputSchema)
    )
    .query(async ({ ctx, input }) => {
      const { id, type, name, notes, sorting } = input
      const { offset, limit } = resolvePagination(input)

      const whereConditions = {
        ...(id && { id: { contains: id } }),
        ...(type && { type: { contains: type } }),
        ...(name && { name: { contains: name } }),
        ...(notes && { notes: { contains: notes } }),
      }

      const [items, total] = await Promise.all([
        ctx.prisma.requisite.findMany({
          where: whereConditions,
          orderBy: getSortings(sorting),
          skip: offset,
          take: limit,
          include: {
            rules: true,
            prereq_courses: { select: { id: true, code: true, name: true } },
            coreq_courses: { select: { id: true, code: true, name: true } },
            antireq_courses: { select: { id: true, code: true, name: true } },
            programs: { select: { id: true, code: true, name: true } },
            requisite_sets: { select: { id: true, name: true } },
          },
        }),
        ctx.prisma.requisite.count({
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
      const requisite = await ctx.prisma.requisite.findUnique({
        where: { id: input.id },
        include: {
          rules: true,
          prereq_courses: true,
          coreq_courses: true,
          antireq_courses: true,
          programs: true,
          requisite_sets: true,
        },
      })

      if (!requisite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The requested requisite was not found.",
        })
      }

      return requisite
    }),
})
