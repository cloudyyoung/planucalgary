import { TRPCError } from "@trpc/server"
import {
  CourseCreateReqBodySchema,
  CourseDeleteReqParamsSchema,
  CourseGetReqParamsSchema,
  CourseListReqQuerySchema,
  CourseUpdateReqBodySchema,
  CourseUpdateReqParamsSchema,
  getSortings,
} from "@planucalgary/shared"
import { Course, Prisma } from "@planucalgary/shared/prisma/client"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init"

const ensureAdmin = (isAdmin: boolean | undefined) => {
  if (!isAdmin) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized endpoint",
    })
  }
}

export const coursesRouter = createTRPCRouter({
  list: publicProcedure.input(CourseListReqQuerySchema).query(async ({ ctx, input }) => {
    const keywords = input.keywords
    const offset = input.offset ?? 0
    const limit = input.limit ?? 100
    const sorting = input.sorting

    const getSelectStatement = () => {
      const fields = [
        Prisma.sql`id`,
        Prisma.sql`ts_rank(search_vector, plainto_tsquery('english', ${keywords})) AS rank`,
      ]

      return Prisma.sql`select ${Prisma.join(fields, ", ")} from "catalog"."courses"`
    }

    const getWhereStatement = () => {
      const whereSegments = []

      whereSegments.push(Prisma.sql`is_active = true`)

      if (keywords) {
        whereSegments.push(Prisma.sql`search_vector @@ plainto_tsquery('english', ${keywords})`)
      }

      if (whereSegments.length === 0) {
        return Prisma.empty
      }

      return Prisma.sql`where ${Prisma.join(whereSegments, " and ")}`
    }

    const getOrderByStatement = () => {
      if (!sorting || sorting.length === 0) {
        return Prisma.sql`order by rank desc`
      }

      const sortings = getSortings(sorting)
      const orderBySegments = sortings.map((sort) => {
        const column = Object.keys(sort)[0]
        const direction = sort[column]
        return Prisma.sql`${Prisma.raw(column)} ${Prisma.raw(direction)}`
      })

      return Prisma.sql`order by ${Prisma.join(orderBySegments, ", ")}`
    }

    const selectStatement = getSelectStatement()
    const whereStatement = getWhereStatement()
    const orderByStatement = getOrderByStatement()

    const queryString = Prisma.sql`
      ${selectStatement}
      ${whereStatement}
      ${orderByStatement}
      offset ${offset}
      limit ${limit}
    `
    const totalQueryString = Prisma.sql`select count(*)::int from "catalog"."courses" ${whereStatement}`

    const [courseIds, totalResult] = await Promise.all([
      await ctx.prisma.$queryRaw<Course[]>(queryString),
      await ctx.prisma.$queryRaw<[{ count: number }]>(totalQueryString),
    ])

    const courses = await ctx.prisma.course.findMany({
      where: { id: { in: courseIds.map((c) => c.id) } },
      include: {
        subject: true,
        departments: true,
        faculties: true,
        topics: true,
        prereq_requisite: {
          include: {
            rules: {
              include: {
                referring_courses: true,
                referring_programs: true,
                referring_course_sets: true,
                referring_requisite_sets: true,
              },
            },
          },
        },
        coreq_requisite: {
          include: {
            rules: {
              include: {
                referring_courses: true,
                referring_programs: true,
                referring_course_sets: true,
                referring_requisite_sets: true,
              },
            },
          },
        },
        antireq_requisite: {
          include: {
            rules: {
              include: {
                referring_courses: true,
                referring_programs: true,
                referring_course_sets: true,
                referring_requisite_sets: true,
              },
            },
          },
        },
      },
    })

    const total = totalResult[0].count
    const has_more = total - (offset + limit) > 0

    return {
      total,
      offset,
      limit,
      has_more,
      items: courses,
    }
  }),

  get: publicProcedure.input(CourseGetReqParamsSchema).query(async ({ ctx, input }) => {
    const course = await ctx.prisma.course.findUnique({
      where: { id: input.id },
      include: {
        subject: true,
        departments: true,
        faculties: true,
        topics: true,
      },
    })

    if (!course) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested course was not found.",
      })
    }

    return course
  }),

  create: protectedProcedure.input(CourseCreateReqBodySchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    const existing = await ctx.prisma.course.findFirst({
      where: { id: input.id },
    })

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A course with the given CID already exists.",
      })
    }

    return ctx.prisma.course.create({
      data: {
        ...input,
        raw_requisites: input.raw_requisites as any,
        subject: {
          connectOrCreate: {
            where: { code: input.subject },
            create: { code: input.subject, title: input.subject },
          },
        },
        departments: {
          connectOrCreate: input.departments?.map((code) => ({
            where: { code },
            create: { code, name: code, display_name: code, is_active: false },
          })),
        },
        faculties: {
          connectOrCreate: input.faculties?.map((code) => ({
            where: { code },
            create: { code, name: code, display_name: code, is_active: false },
          })),
        },
        topics: {
          create: input.topics,
        },
        start_term: input.start_term as any,
        end_term: input.end_term as any,
      },
    })
  }),

  update: protectedProcedure
    .input(CourseUpdateReqBodySchema.omit({ id: true }).merge(CourseUpdateReqParamsSchema))
    .mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.account.is_admin)

      const { id, ...updateData } = input

      return ctx.prisma.course.update({
        where: { id },
        data: {
          ...updateData,
          raw_requisites: updateData.raw_requisites as any,
          subject: {
            connectOrCreate: {
              where: { code: updateData.subject },
              create: { code: updateData.subject, title: updateData.subject },
            },
          },
          departments: {
            connectOrCreate: updateData.departments?.map((code) => ({
              where: { code },
              create: { code, name: code, display_name: code, is_active: false },
            })),
            set: updateData.departments?.map((code) => ({ code })),
          },
          faculties: {
            connectOrCreate: updateData.faculties?.map((code) => ({
              where: { code },
              create: { code, name: code, display_name: code, is_active: false },
            })),
            set: updateData.faculties?.map((code) => ({ code })),
          },
          topics: {
            connectOrCreate: updateData.topics?.map((topic) => ({
              where: {
                number_course_id: {
                  number: topic.number,
                  course_id: id,
                },
              },
              create: topic,
            })),
            set: updateData.topics?.map((topic) => ({
              number_course_id: {
                number: topic.number,
                course_id: id,
              },
            })),
          },
          start_term: updateData.start_term as any,
          end_term: updateData.end_term as any,
        },
      })
    }),

  delete: protectedProcedure.input(CourseDeleteReqParamsSchema).mutation(async ({ ctx, input }) => {
    ensureAdmin(ctx.account.is_admin)

    await ctx.prisma.course.delete({
      where: { id: input.id },
    })

    return {
      success: true,
    }
  }),
})