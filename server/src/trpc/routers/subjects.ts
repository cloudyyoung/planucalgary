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

const SubjectCodeParamsSchema = z.object({
  code: z.string(),
})

const SubjectListReqQuerySchema = z
  .object({
    id: z.string().optional(),
    code: z.string().optional(),
    title: z.string().optional(),
    sorting: z.array(z.string()).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(0).max(5000).optional(),
  })
  .loose()

const SubjectCreateBodySchema = z
  .object({
    code: z.string(),
    title: z.string(),
    departments: z.array(z.string()).optional(),
    faculties: z.array(z.string()).optional(),
  })
  .loose()

const SubjectUpdateBodySchema = z
  .object({
    title: z.string().optional(),
    departments: z.array(z.string()).optional(),
    faculties: z.array(z.string()).optional(),
  })
  .loose()

export const subjectsRouter = createTRPCRouter({
  list: publicProcedure.input(SubjectListReqQuerySchema).query(async ({ ctx, input }) => {
    const { id, code, title, sorting } = input
    const offset = input.offset ?? 0
    const limit = input.limit ?? 100

    const whereConditions = {
      ...(id && { id: { contains: id } }),
      ...(code && { code: { contains: code } }),
      ...(title && { title: { contains: title } }),
    }

    const [items, total] = await Promise.all([
      ctx.prisma.subject.findMany({
        where: whereConditions,
        orderBy: getSortings(sorting),
        skip: offset,
        take: limit,
      }),
      ctx.prisma.subject.count({
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

  get: publicProcedure.input(SubjectCodeParamsSchema).query(async ({ ctx, input }) => {
    const subject = await ctx.prisma.subject.findUnique({
      where: { code: input.code },
    })

    if (!subject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested subject was not found.",
      })
    }

    return subject
  }),

  create: authenticatedProcedure.input(SubjectCreateBodySchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const existing = await ctx.prisma.subject.findFirst({
      where: { code: input.code },
    })

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A subject already exists.",
      })
    }

    return ctx.prisma.subject.create({
      data: {
        ...input,
        departments: {
          connectOrCreate: input.departments?.map((departmentCode: string) => ({
            where: { code: departmentCode },
            create: { code: departmentCode, name: departmentCode, display_name: departmentCode, is_active: false },
          })),
        },
        faculties: {
          connectOrCreate: input.faculties?.map((facultyCode: string) => ({
            where: { code: facultyCode },
            create: { code: facultyCode, name: facultyCode, display_name: facultyCode, is_active: false },
          })),
        },
      },
    })
  }),

  update: authenticatedProcedure
    .input(SubjectUpdateBodySchema.merge(SubjectCodeParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { code, ...updateData } = input

      return ctx.prisma.subject.update({
        where: { code },
        data: {
          ...updateData,
          departments: {
            connectOrCreate: updateData.departments?.map((departmentCode: string) => ({
              where: { code: departmentCode },
              create: { code: departmentCode, name: departmentCode, display_name: departmentCode, is_active: false },
            })),
          },
          faculties: {
            connectOrCreate: updateData.faculties?.map((facultyCode: string) => ({
              where: { code: facultyCode },
              create: { code: facultyCode, name: facultyCode, display_name: facultyCode, is_active: false },
            })),
          },
        },
      })
    }),

  delete: authenticatedProcedure.input(SubjectCodeParamsSchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.subject.delete({
      where: { code: input.code },
    })

    return {
      success: true,
    }
  }),
})