import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"
import { paginationInputSchema, resolvePagination } from "../pagination"

import { createTRPCRouter, adminProcedure, publicProcedure } from "../init"

export const requisiteSetsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        csid: z.string().optional(),
        requisite_set_group_id: z.string().optional(),
        version: z.coerce.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        sorting: z.array(z.string()).optional(),
      })
        .merge(paginationInputSchema)
    )
    .query(async ({ ctx, input }) => {
      const { id, csid, requisite_set_group_id, version, name, description, sorting } = input
      const { offset, limit } = resolvePagination(input)

      const whereConditions = {
        ...(id && { id: { contains: id } }),
        ...(csid && { csid: { contains: csid } }),
        ...(requisite_set_group_id && { requisite_set_group_id: { contains: requisite_set_group_id } }),
        ...(version !== undefined && { version }),
        ...(name && { name: { contains: name } }),
        ...(description && { description: { contains: description } }),
      }

      const [items, total] = await Promise.all([
        ctx.prisma.requisiteSet.findMany({
          include: {
            requisites: {
              include: {
                rules: true,
              },
            }
          },
          where: whereConditions,
          orderBy: getSortings(sorting),
          skip: offset,
          take: limit,
        }),
        ctx.prisma.requisiteSet.count({
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
      const requisiteSet = await ctx.prisma.requisiteSet.findUnique({
        where: { id: input.id },
      })

      if (!requisiteSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The requested requisite set was not found.",
        })
      }

      return requisiteSet
    }),

  create: adminProcedure
    .input(z.object({ requisite_set_group_id: z.string(), raw_json: z.any().optional() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.requisiteSet.findFirst({
        where: { requisite_set_group_id: input.requisite_set_group_id },
      })

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A requisite set already exists.",
        })
      }

      return ctx.prisma.requisiteSet.create({
        data: {
          ...input,
          raw_json: input.raw_json as any,
        } as any,
      })
    }),

  update: adminProcedure
    .input(z.object({ raw_json: z.any().optional() }).merge(z.object({ id: z.string() })))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      return ctx.prisma.requisiteSet.update({
        where: { id },
        data: {
          ...updateData,
          raw_json: updateData.raw_json as any,
        },
      })
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.requisiteSet.delete({
      where: { id: input.id },
    })

    return {
      success: true,
    }
  }),
})