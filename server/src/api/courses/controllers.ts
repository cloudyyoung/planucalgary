import { CourseListHandler, CourseGetHandler, CourseCreateHandler, CourseUpdateHandler, CourseDeleteHandler, CourseCrawlHandler, getSortings } from "@planucalgary/shared"
import { Course, Prisma } from "@planucalgary/shared/prisma/client"
import { CourseAlreadyExistsError, CourseNotFoundError } from "./errors"
import { catalogQueue } from "@/queue"

export const listCourses: CourseListHandler = async (req, res) => {
  const keywords = req.query.keywords
  const offset = req.pagination.offset
  const limit = req.pagination.limit
  const sorting = req.query.sorting

  const getSelectStatement = () => {
    const fields = [
      Prisma.sql`id`,
      Prisma.sql`created_at`,
      Prisma.sql`updated_at`,
      Prisma.sql`cid`,
      Prisma.sql`code`,
      Prisma.sql`course_number`,
      Prisma.sql`subject_code`,
      Prisma.sql`description`,
      Prisma.sql`name`,
      Prisma.sql`long_name`,
      Prisma.sql`notes`,
      Prisma.sql`version`,
      Prisma.sql`units`,
      Prisma.sql`aka`,
      Prisma.sql`prereq`,
      Prisma.sql`coreq`,
      Prisma.sql`antireq`,
      Prisma.sql`prereq_json`,
      Prisma.sql`coreq_json`,
      Prisma.sql`antireq_json`,
      Prisma.sql`is_active`,
      Prisma.sql`is_multi_term`,
      Prisma.sql`is_no_gpa`,
      Prisma.sql`is_repeatable`,
      Prisma.sql`course_group_id`,
      Prisma.sql`coursedog_id`,
      Prisma.sql`course_created_at`,
      Prisma.sql`course_effective_start_date`,
      Prisma.sql`course_last_updated_at`,
      Prisma.sql`career`,
      Prisma.sql`grade_mode`,
      Prisma.sql`updated_at`,
      Prisma.sql`created_at`,
      Prisma.sql`ts_rank(search_vector, plainto_tsquery('english', ${keywords})) AS rank`,
    ]

    if (req.account?.is_admin) {
      fields.push(Prisma.sql`raw_json`)
    }

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

  const [courses, totalResult] = await Promise.all([
    await req.prisma.$queryRaw<Course[]>(queryString),
    await req.prisma.$queryRaw<[{ count: number }]>(totalQueryString),
  ])
  const total = totalResult[0].count
  res.paginate(courses, total)
}

export const getCourse: CourseGetHandler = async (req, res) => {
  const course = await req.prisma.course.findUnique({
    where: { id: req.params.id },
    include: {
      subject: true,
      departments: true,
      faculties: true,
      topics: true,
    },
  })
  if (!course) {
    throw new CourseNotFoundError()
  }
  return res.json(course)
}

export const createCourse: CourseCreateHandler = async (req, res) => {
  const existing = await req.prisma.course.findFirst({
    where: { course_group_id: req.body.course_group_id, cid: req.body.cid },
  })

  if (existing) {
    throw new CourseAlreadyExistsError(existing.id)
  }

  const course = await req.prisma.course.create({
    data: {
      ...req.body,
      raw_json: req.body.raw_json as any,
      prereq_json: req.body.prereq_json as any,
      antireq_json: req.body.antireq_json as any,
      coreq_json: req.body.coreq_json as any,
      subject: {
        connectOrCreate: {
          where: { code: req.body.subject },
          create: { code: req.body.subject, title: req.body.subject },
        }
      },
      departments: {
        connectOrCreate: req.body.departments?.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
      faculties: {
        connectOrCreate: req.body.faculties?.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
      topics: {
        create: req.body.topics,
      },
    },
  })

  return res.json(course)
}

export const updateCourse: CourseUpdateHandler = async (req, res) => {
  const course = await req.prisma.course.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      raw_json: req.body.raw_json as any,
      subject: {
        connectOrCreate: {
          where: { code: req.body.subject },
          create: { code: req.body.subject, title: req.body.subject },
        }
      },
      prereq_json: req.body.prereq_json as any,
      antireq_json: req.body.antireq_json as any,
      coreq_json: req.body.coreq_json as any,
      departments: {
        connectOrCreate: req.body.departments?.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
        set: req.body.departments?.map((code) => ({ code })),
      },
      faculties: {
        connectOrCreate: req.body.faculties?.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
        set: req.body.faculties?.map((code) => ({ code }))
      },
      topics: {
        connectOrCreate: req.body.topics?.map((topic) => ({
          where: {
            number_course_id: {
              number: topic.number,
              course_id: req.params.id,
            },
          },
          create: topic,
        })),
        set: req.body.topics?.map((topic) => ({
          number_course_id: {
            number: topic.number,
            course_id: req.params.id,
          }
        })),
      },
    },
  })

  return res.json(course)
}

export const deleteCourse: CourseDeleteHandler = async (req, res) => {
  await req.prisma.course.delete({
    where: { id: req.params.id },
  })
  return res.sendStatus(204)
}

export const crawlCourses: CourseCrawlHandler = async (req, res) => {
  const jobId = await catalogQueue.add("crawl-courses", {})

  if (!jobId) {
    return res.sendStatus(500)
  }

  return res.sendStatus(202)
}
