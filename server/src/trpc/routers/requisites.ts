import { TRPCError } from "@trpc/server"
import {
  RequisiteGenerateChoicesReqParamsSchema,
  RequisiteGetReqParamsSchema,
  RequisiteListReqQuerySchema,
  RequisiteUpdateReqBodySchema,
  RequisitesSyncDestination,
  RequisitesSyncDestinationSchema,
  getSortings,
} from "../../contracts"

import { catalogQueue } from "../../queue"
import { createTRPCRouter, protectedProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

const SyncInputSchema = RequisitesSyncDestinationSchema.transform((destination) => ({ destination }))

export const requisitesRouter = createTRPCRouter({
  list: protectedProcedure.input(RequisiteListReqQuerySchema).query(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const { id, requisite_type, text, sorting } = input
    const offset = input.offset ?? 0
    const limit = input.limit ?? 100

    const whereConditions = {
      ...(id && { id: { contains: id } }),
      ...(requisite_type && { requisite_type }),
      ...(text && { text: { contains: text } }),
    }

    const [items, total] = await Promise.all([
      ctx.prisma.requisiteJson.findMany({
        where: whereConditions,
        orderBy: [...getSortings(sorting), { requisite_type: "asc" }, { id: "asc" }],
        skip: offset,
        take: limit,
      }),
      ctx.prisma.requisiteJson.count({
        where: whereConditions,
      }),
    ])

    const validatedItems = items.map((requisite) => {
      return {
        ...requisite,
        json_valid: true,
        json_errors: [],
        json_warnings: [],
      }
    })

    return {
      total,
      offset,
      limit,
      has_more: total - (offset + limit) > 0,
      items: validatedItems,
    }
  }),

  get: protectedProcedure.input(RequisiteGetReqParamsSchema).query(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const requisite = await ctx.prisma.requisiteJson.findUnique({
      where: { id: input.id },
    })

    if (!requisite) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested requisite was not found.",
      })
    }

    return {
      ...requisite,
      json_valid: true,
      json_errors: [],
      json_warnings: [],
    }
  }),

  update: protectedProcedure
    .input(RequisiteUpdateReqBodySchema.merge(RequisiteGetReqParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { id, ...updateData } = input

      const existing = await ctx.prisma.requisiteJson.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The requested requisite was not found.",
        })
      }

      const requisite = await ctx.prisma.requisiteJson.update({
        where: { id },
        data: {
          ...updateData,
          json: updateData.json as any,
          json_choices: updateData.json_choices as any,
          raw_json: updateData.raw_json as any,
        },
      })

      return {
        ...requisite,
        json_valid: true,
        json_errors: [],
        json_warnings: [],
      }
    }),

  generateChoices: protectedProcedure
    .input(RequisiteGenerateChoicesReqParamsSchema)
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const existing = await ctx.prisma.requisiteJson.findUnique({
        where: { id: input.id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The requested requisite was not found.",
        })
      }

      const jsonChoices = [existing.json]

      const updated = await ctx.prisma.requisiteJson.update({
        where: { id: input.id },
        data: { json_choices: jsonChoices, json: jsonChoices[0] },
      })

      return {
        ...updated,
        json_valid: true,
        json_errors: [],
        json_warnings: [],
      }
    }),

  sync: protectedProcedure.input(SyncInputSchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    let jobName: string
    if (input.destination === RequisitesSyncDestination.REQUISITES_JSONS) {
      jobName = "sync-requisites-jsons"
    } else if (input.destination === RequisitesSyncDestination.COURSES) {
      jobName = "build-requisite-rules"
    } else if (input.destination === RequisitesSyncDestination.COURSE_SETS) {
      jobName = "build-course-sets"
    } else if (input.destination === RequisitesSyncDestination.FIELDS_OF_STUDY) {
      jobName = "sync-fields-of-study"
    } else {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The provided sync destination is invalid.",
      })
    }

    await catalogQueue.add(jobName, {}, { removeOnComplete: true, removeOnFail: 1000 })

    return {
      message: `${input.destination} sync job is queued.`,
      affected_rows: 0,
    }
  }),
})