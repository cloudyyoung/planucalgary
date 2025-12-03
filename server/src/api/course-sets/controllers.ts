import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { CourseSetCreate, CourseSetUpdate } from "@planucalgary/shared"

export const listCourseSets = async (req: Request, res: Response) => {
  const courseSets = await req.prisma.courseSet.findMany()
  return res.json(courseSets)
}

export const getCourseSet = async (req: Request, res: Response) => {
  const fac = await req.prisma.courseSet.findUnique({
    where: { id: req.params.id },
  })
  return res.json(fac)
}

export const createCourseSet = async (req: Request<ParamsDictionary, any, CourseSetCreate>, res: Response) => {
  const existing = await req.prisma.courseSet.findFirst({
    where: { csid: req.body.csid },
  })
  if (existing) {
    return res.status(403).json({ error: "Course set already exists", existing })
  }

  const fac = await req.prisma.courseSet.create({ data: req.body })
  return res.json(fac)
}

export const updateCourseSet = async (req: Request<ParamsDictionary, any, CourseSetUpdate>, res: Response) => {
  const fac = await req.prisma.courseSet.update({
    where: { id: req.params.id },
    data: req.body,
  })
  return res.json(fac)
}

export const deleteCourseSet = async (req: Request, res: Response) => {
  const fac = await req.prisma.courseSet.delete({
    where: { id: req.params.id },
  })
  return res.json(fac)
}
