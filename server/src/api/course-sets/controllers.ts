import { CourseSetCreateHandler, CourseSetDeleteHandler, CourseSetGetHandler, CourseSetListHandler, CourseSetUpdateHandler, getSortings } from "@planucalgary/shared"
import { CourseSetAlreadyExistsError, CourseSetNotFoundError } from "./errors";

export const listCourseSets: CourseSetListHandler = async (req, res) => {
  const { type, id, course_set_group_id, name, description, csid, sorting } = req.query;
  const whereConditions = {
    ...(id && { id: { contains: id } }),
    ...(type && { type }),
    ...(course_set_group_id && { course_set_group_id: { contains: course_set_group_id } }),
    ...(name && { name: { contains: name } }),
    ...(description && { description: { contains: description } }),
    ...(csid && { csid: { contains: csid } }),
  }
  const [courseSets, total] = await Promise.all([
    req.prisma.courseSet.findMany({
      where: whereConditions,
      orderBy: getSortings(sorting),
      skip: req.pagination.offset,
      take: req.pagination.limit,
    }),
    req.prisma.courseSet.count({
      where: whereConditions,
    }),
  ])

  return res.paginate(courseSets, total)
}

export const getCourseSet: CourseSetGetHandler = async (req, res) => {
  const { id } = req.params;
  const courseSet = await req.prisma.courseSet.findUnique({
    where: { id },
  })

  if (!courseSet) {
    throw new CourseSetNotFoundError()
  }

  return res.json(courseSet)
}

export const createCourseSet: CourseSetCreateHandler = async (req, res) => {
  const existing = await req.prisma.courseSet.findFirst({
    where: { csid: req.body.csid },
  })

  if (existing) {
    throw new CourseSetAlreadyExistsError()
  }

  const courseSet = await req.prisma.courseSet.create({
    data: {
      ...req.body,
      json: req.body.json as any,
    },
  })

  return res.json(courseSet)
}

export const updateCourseSet: CourseSetUpdateHandler = async (req, res) => {
  const courseSet = await req.prisma.courseSet.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      json: req.body.json as any,
    },
  })
  return res.json(courseSet)
}

export const deleteCourseSet: CourseSetDeleteHandler = async (req, res) => {
  await req.prisma.courseSet.delete({
    where: { id: req.params.id },
  })
  return res.sendStatus(204)
}
