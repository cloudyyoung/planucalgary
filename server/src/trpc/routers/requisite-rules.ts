import { TRPCError } from "@trpc/server"
import {
  RequisiteRuleCreateBodySchema,
  RequisiteRuleDeleteParamsSchema,
  RequisiteRuleGetParamsSchema,
  RequisiteRuleListReqQuerySchema,
  RequisiteRuleUpdateBodySchema,
  RequisiteRuleUpdateParamsSchema,
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

export const requisiteRulesRouter = createTRPCRouter({
  list: publicProcedure.input(RequisiteRuleListReqQuerySchema).query(async ({ ctx, input }) => {
    const { id, requisite_id, parent_rule_id, name, description, notes, condition, grade, grade_type, sorting } = input
    const offset = input.offset ?? 0
    const limit = input.limit ?? 100

    const whereConditions = {
      ...(id && { id: { contains: id } }),
      ...(requisite_id && { requisite_id: { contains: requisite_id } }),
      ...(parent_rule_id && { parent_rule_id: { contains: parent_rule_id } }),
      ...(name && { name: { contains: name } }),
      ...(description && { description: { contains: description } }),
      ...(notes && { notes: { contains: notes } }),
      ...(condition && { condition: { contains: condition } }),
      ...(grade && { grade: { contains: grade } }),
      ...(grade_type && { grade_type: { contains: grade_type } }),
    }

    const [items, total] = await Promise.all([
      ctx.prisma.requisiteRule.findMany({
        where: whereConditions,
        orderBy: getSortings(sorting),
        skip: offset,
        take: limit,
        include: {
          referring_course_sets: true,
          referring_programs: true,
          referring_courses: true,
          referring_requisite_sets: true,
        },
      }),
      ctx.prisma.requisiteRule.count({
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

  get: publicProcedure.input(RequisiteRuleGetParamsSchema).query(async ({ ctx, input }) => {
    const requisiteRule = await ctx.prisma.requisiteRule.findUnique({
      where: { id: input.id },
    })

    if (!requisiteRule) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested requisite rule was not found.",
      })
    }

    return requisiteRule
  }),

  create: protectedProcedure.input(RequisiteRuleCreateBodySchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const existing = await ctx.prisma.requisiteRule.findUnique({
      where: { id: input.id },
    })

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A requisite rule already exists.",
      })
    }

    return ctx.prisma.requisiteRule.create({
      data: {
        ...input,
        raw_json: input.raw_json as any,
      },
    })
  }),

  update: protectedProcedure
    .input(RequisiteRuleUpdateBodySchema.merge(RequisiteRuleUpdateParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { id, ...updateData } = input

      const existing = await ctx.prisma.requisiteRule.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The requested requisite rule was not found.",
        })
      }

      return ctx.prisma.requisiteRule.update({
        where: { id },
        data: {
          ...updateData,
          raw_json: updateData.raw_json as any,
        },
      })
    }),

  delete: protectedProcedure.input(RequisiteRuleDeleteParamsSchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const existing = await ctx.prisma.requisiteRule.findUnique({
      where: { id: input.id },
    })

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested requisite rule was not found.",
      })
    }

    await ctx.prisma.requisiteRule.delete({
      where: { id: input.id },
    })

    return {
      success: true,
    }
  }),
})