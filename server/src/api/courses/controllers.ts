import { CourseListHandler, CourseGetHandler, CourseCreateHandler, CourseUpdateHandler, CourseDeleteHandler, getSortings } from "@planucalgary/shared"
import { Course, Prisma } from "@prisma/client"
import { CourseAlreadyExistsError, CourseNotFoundError } from "./errors"

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
    ]

    fields.push(Prisma.sql`ts_rank(search_vector, plainto_tsquery('english', ${keywords})) AS rank`)

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
    where: { cid: req.body.cid },
  })
  if (existing) {
    throw new CourseAlreadyExistsError()
  }

  const [departments, faculties] = await Promise.all([
    req.prisma.department.findMany({
      where: { code: { in: req.body.departments } },
    }),
    req.prisma.faculty.findMany({
      where: { code: { in: req.body.faculties } },
    }),
  ])

  const departmentCodes = departments.map((department) => ({
    code: department.code,
  }))

  const facultyCodes = faculties.map((faculty) => ({
    code: faculty.code,
  }))

  const course = await req.prisma.course.create({
    data: {
      ...(req.body as any),
      subject_code: undefined,
      subject: {
        connect: { code: req.body.subject_code },
      },
      departments: {
        connect: departmentCodes,
      },
      faculties: {
        connect: facultyCodes,
      },
      topics: {
        create: req.body.topics,
      },
    },
  })

  return res.json(course)
}

export const updateCourse: CourseUpdateHandler = async (req, res) => {
  const [departments, faculties] = await Promise.all([
    req.prisma.department.findMany({
      where: { code: { in: req.body.departments } },
    }),
    req.prisma.faculty.findMany({
      where: { code: { in: req.body.faculties } },
    }),
  ])

  const deaprtmentCodes = departments.map((department) => ({
    code: department.code,
  }))

  const facultyCodes = faculties.map((faculty) => ({
    code: faculty.code,
  }))

  const course = await req.prisma.course.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      subject_code: undefined,
      subject: {
        connect: req.body.subject_code ? { code: req.body.subject_code } : undefined,
      },
      prereq_json: req.body.prereq_json ? req.body.prereq_json : undefined,
      antireq_json: req.body.antireq_json ? req.body.antireq_json : undefined,
      coreq_json: req.body.coreq_json ? req.body.coreq_json : undefined,
      departments: {
        connect: req.body.departments ? deaprtmentCodes : undefined,
      },
      faculties: {
        connect: req.body.faculties ? facultyCodes : undefined,
      },
      topics: {
        connectOrCreate: req.body.topics?.map((topic) => ({
          where: { number_course_id: { number: topic.number, course_id: req.params.id } },
          create: topic,
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
  return res.json()
}
