import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { getSortings } from "../sorting"
import { paginationInputSchema, resolvePagination, hasMorePages } from "../pagination"

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

export const requisitesRouter = createTRPCRouter({
  list: adminProcedure
    .input(
      z.object({
        id: z.string().optional(),
        requisite_type: z.string().optional(),
        text: z.string().optional(),
        sorting: z.array(z.string()).optional(),
      })
      .merge(paginationInputSchema)
    )
    .query(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const { id, requisite_type, text, sorting } = input
    const { offset, limit } = resolvePagination(input)

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
      has_more: hasMorePages(total, offset, limit),
      items: validatedItems,
    }
    }),

  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
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
    .input(
      z
        .object({
          json: z.any().optional(),
          json_choices: z.any().optional(),
          raw_json: z.any().optional(),
        })
        .merge(z.object({ id: z.string() }))
    )
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
    .input(z.object({ id: z.string() }))
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

  sync: adminProcedure
    .input(
      z
        .enum([
          RequisitesSyncDestination.REQUISITES_JSONS,
          RequisitesSyncDestination.COURSES,
          RequisitesSyncDestination.COURSE_SETS,
          RequisitesSyncDestination.FIELDS_OF_STUDY,
        ])
        .transform((destination) => ({ destination }))
    )
    .mutation(async ({ ctx, input }) => {
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