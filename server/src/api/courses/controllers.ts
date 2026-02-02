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
      Prisma.sql`ts_rank(search_vector, plainto_tsquery('english', ${keywords})) AS rank`,
    ]

    // if (req.account?.is_admin) {
    //   fields.push(Prisma.sql`raw_requisites`)
    // }

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
    await req.prisma.$queryRaw<Course[]>(queryString),
    await req.prisma.$queryRaw<[{ count: number }]>(totalQueryString),
  ])
  const courses = await req.prisma.course.findMany({
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
              courses: true,
              programs: true,
              course_sets: true,
              requisite_sets: true,
            },
          },
        },
      },
      coreq_requisite: {
        include: {
          rules: {
            include: {
              courses: true,
              programs: true,
              course_sets: true,
              requisite_sets: true,
            },
          },
        },
      },
      antireq_requisite: {
        include: {
          rules: {
            include: {
              courses: true,
              programs: true,
              course_sets: true,
              requisite_sets: true,
            },
          },
        },
      },
    },
  })

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
    where: { id: req.body.id },
  })

  if (existing) {
    throw new CourseAlreadyExistsError(existing.id)
  }

  const course = await req.prisma.course.create({
    data: {
      ...req.body,
      raw_requisites: req.body.raw_requisites as any,
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
      start_term: req.body.start_term as any,
      end_term: req.body.end_term as any,
    },
  })

  return res.json(course)
}

export const updateCourse: CourseUpdateHandler = async (req, res) => {
  const course = await req.prisma.course.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      raw_requisites: req.body.raw_requisites as any,
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
      start_term: req.body.start_term as any,
      end_term: req.body.end_term as any,
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
  await catalogQueue.add("courses", {})
  return res.sendStatus(202)
}
