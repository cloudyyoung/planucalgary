import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { FacultyCreate, FacultyUpdate } from "@planucalgary/shared"

export const listFaculties = async (req: Request, res: Response) => {
  const faculties = await req.prisma.faculty.findMany()
  return res.json(faculties)
}

export const getFaculty = async (req: Request, res: Response) => {
  const fac = await req.prisma.faculty.findUnique({
    where: { id: req.params.id },
    include: {
      departments: true,
      courses: true,
    },
  })
  return res.json(fac)
}

export const createFaculty = async (req: Request<ParamsDictionary, any, FacultyCreate>, res: Response) => {
  const existing = await req.prisma.faculty.findFirst({
    where: { code: req.body.code },
  })
  if (existing) {
    return res.status(403).json({ error: "Faculty already exists", existing })
  }

  const fac = await req.prisma.faculty.create({ data: req.body })
  return res.json(fac)
}

export const updateFaculty = async (req: Request<ParamsDictionary, any, FacultyUpdate>, res: Response) => {
  const fac = await req.prisma.faculty.update({
    where: { id: req.params.id },
    data: req.body,
  })
  return res.json(fac)
}

export const deleteFaculty = async (req: Request, res: Response) => {
  const fac = await req.prisma.faculty.delete({
    where: { id: req.params.id },
  })
  return res.json(fac)
}
