import { TRPCError } from "@trpc/server"
import {
  RequisiteSetCreateBodySchema,
  RequisiteSetDeleteParamsSchema,
  RequisiteSetGetParamsSchema,
  RequisiteSetListReqQuerySchema,
  RequisiteSetUpdateBodySchema,
  RequisiteSetUpdateParamsSchema,
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

export const requisiteSetsRouter = createTRPCRouter({
  list: publicProcedure.input(RequisiteSetListReqQuerySchema).query(async ({ ctx, input }) => {
    const { id, csid, requisite_set_group_id, version, name, description, sorting } = input
    const offset = input.offset ?? 0
    const limit = input.limit ?? 100

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
      has_more: total - (offset + limit) > 0,
      items,
    }
  }),

  get: publicProcedure.input(RequisiteSetGetParamsSchema).query(async ({ ctx, input }) => {
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

  create: protectedProcedure.input(RequisiteSetCreateBodySchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

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
      },
    })
  }),

  update: protectedProcedure
    .input(RequisiteSetUpdateBodySchema.merge(RequisiteSetUpdateParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { id, ...updateData } = input

      return ctx.prisma.requisiteSet.update({
        where: { id },
        data: {
          ...updateData,
          raw_json: updateData.raw_json as any,
        },
      })
    }),

  delete: protectedProcedure.input(RequisiteSetDeleteParamsSchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.requisiteSet.delete({
      where: { id: input.id },
    })

    return {
      success: true,
    }
  }),
})