import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { CourseCreateRelations, CourseUpdateRelations, CourseList } from "./validators"
import { CourseCreate, CourseUpdate } from "@planucalgary/shared"
import { IdInput } from "../../middlewares"
import { Course, Prisma } from "@prisma/client"

export const listCourses = async (req: Request<any, any, any, CourseList>, res: Response) => {
  const keywords = req.query.keywords
  const offset = req.pagination.offset
  const limit = req.pagination.limit
  const is_admin = req.account?.is_admin === true

  const getSelectStatement = () => {
    const fields = [
      Prisma.sql`id`,
      Prisma.sql`code`,
      Prisma.sql`subject_code`,
      Prisma.sql`course_number`,
      Prisma.sql`description`,
      Prisma.sql`name`,
      Prisma.sql`long_name`,
      Prisma.sql`units`,
      Prisma.sql`aka`,
      Prisma.sql`career`,
      Prisma.sql`is_active`,
      Prisma.sql`is_multi_term`,
      Prisma.sql`is_nogpa`,
      Prisma.sql`is_repeatable`,
    ]

    if (is_admin) {
      fields.push(Prisma.sql`prereq`)
      fields.push(Prisma.sql`coreq`)
      fields.push(Prisma.sql`antireq`)
      fields.push(Prisma.sql`prereq_json`)
      fields.push(Prisma.sql`coreq_json`)
      fields.push(Prisma.sql`antireq_json`)
    }

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

  const selectStatement = getSelectStatement()
  const whereStatement = getWhereStatement()

  const queryString = Prisma.sql`
      ${selectStatement}
      ${whereStatement}
      order by rank desc
      offset ${offset}
      limit ${limit}
    `
  const totalQueryString = Prisma.sql`select count(*)::int from "catalog"."courses" ${whereStatement}`

  const [courses, totalResult] = await Promise.all([
    await req.prisma.$queryRaw<Course[]>(queryString),
    await req.prisma.$queryRaw<[{ count: number }]>(totalQueryString),
  ])
  const total = totalResult[0].count

  return res.paginate(courses, total)
}

export const getCourse = async (req: Request<IdInput>, res: Response) => {
  const course = await req.prisma.course.findUnique({
    where: { id: req.params.id },
    include: {
      subject: true,
      departments: true,
      faculties: true,
      topics: true,
    },
  })
  return res.json(course)
}

export const createCourse = async (
  req: Request<ParamsDictionary, any, CourseCreate & CourseCreateRelations>,
  res: Response,
) => {
  const existing = await req.prisma.course.findFirst({
    where: { cid: req.body.cid },
  })
  if (existing) {
    return res.status(403).json({ error: "Course with the given cid already exists", existing })
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

export const updateCourse = async (
  req: Request<ParamsDictionary, any, CourseUpdate & CourseUpdateRelations>,
  res: Response,
) => {
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

export const deleteCourse = async (req: Request<IdInput>, res: Response) => {
  const course = await req.prisma.course.delete({
    where: { id: req.params.id },
  })
  return res.json(course)
}
