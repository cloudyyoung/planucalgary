import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"

import { createTRPCRouter, adminProcedure, publicProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

const RequisiteRuleIdParamsSchema = z.object({ id: z.string() })

const RequisiteRuleListReqQuerySchema = z
  .object({
    id: z.string().optional(),
    requisite_id: z.string().optional(),
    parent_rule_id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    condition: z.string().optional(),
    grade: z.string().optional(),
    grade_type: z.string().optional(),
    sorting: z.array(z.string()).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(0).max(5000).optional(),
  })
  .loose()

const RequisiteRuleCreateBodySchema = z.object({ id: z.string(), raw_json: z.any().optional() }).loose()
const RequisiteRuleUpdateBodySchema = z.object({ raw_json: z.any().optional() }).loose()

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

  get: publicProcedure.input(RequisiteRuleIdParamsSchema).query(async ({ ctx, input }) => {
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

  create: adminProcedure.input(RequisiteRuleCreateBodySchema).mutation(async ({ ctx, input }) => {
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
      } as any,
    })
  }),

  update: adminProcedure
    .input(RequisiteRuleUpdateBodySchema.merge(RequisiteRuleIdParamsSchema))
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

  delete: adminProcedure.input(RequisiteRuleIdParamsSchema).mutation(async ({ ctx, input }) => {
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