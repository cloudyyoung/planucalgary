import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"

import { catalogQueue } from "../../queue"
import { createTRPCRouter, adminProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

enum RequisitesSyncDestination {
  REQUISITES_JSONS = "REQUISITES_JSONS",
  COURSES = "COURSES",
  COURSE_SETS = "COURSE_SETS",
  FIELDS_OF_STUDY = "FIELDS_OF_STUDY",
}

const RequisiteIdParamsSchema = z.object({ id: z.string() })
const RequisiteGenerateChoicesReqParamsSchema = RequisiteIdParamsSchema

const RequisiteListReqQuerySchema = z
  .object({
    id: z.string().optional(),
    requisite_type: z.string().optional(),
    text: z.string().optional(),
    sorting: z.array(z.string()).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(0).max(5000).optional(),
  })
  .loose()

const RequisiteUpdateReqBodySchema = z.object({}).loose()

const RequisitesSyncDestinationSchema = z.enum([
  RequisitesSyncDestination.REQUISITES_JSONS,
  RequisitesSyncDestination.COURSES,
  RequisitesSyncDestination.COURSE_SETS,
  RequisitesSyncDestination.FIELDS_OF_STUDY,
])

const SyncInputSchema = RequisitesSyncDestinationSchema.transform((destination) => ({ destination }))

export const requisitesRouter = createTRPCRouter({
  list: adminProcedure.input(RequisiteListReqQuerySchema).query(async ({ ctx, input }) => {
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
        where: whereConditions as any,
        orderBy: [...getSortings(sorting), { requisite_type: "asc" }, { id: "asc" }],
        skip: offset,
        take: limit,
      }),
      ctx.prisma.requisiteJson.count({
        where: whereConditions as any,
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

  get: adminProcedure.input(RequisiteIdParamsSchema).query(async ({ ctx, input }) => {
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

  update: adminProcedure
    .input(RequisiteUpdateReqBodySchema.merge(RequisiteIdParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { id, ...updateData } = input as any

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

  generateChoices: adminProcedure
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
        data: { json_choices: jsonChoices as any, json: jsonChoices[0] as any },
      })

      return {
        ...updated,
        json_valid: true,
        json_errors: [],
        json_warnings: [],
      }
    }),

  sync: adminProcedure.input(SyncInputSchema).mutation(async ({ ctx, input }) => {
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