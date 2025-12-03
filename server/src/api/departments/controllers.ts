import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { DepartmentCreate, DepartmentUpdate } from "@planucalgary/shared"

export const listDepartments = async (req: Request, res: Response) => {
  const faculties = await req.prisma.department.findMany()
  return res.json(faculties)
}

export const getDepartment = async (req: Request, res: Response) => {
  const fac = await req.prisma.department.findUnique({
    where: { id: req.params.id },
    include: {
      faculties: true,
      courses: true,
    },
  })
  return res.json(fac)
}

export const createDepartment = async (req: Request<ParamsDictionary, any, DepartmentCreate>, res: Response) => {
  const existing = await req.prisma.department.findFirst({
    where: { code: req.body.code },
  })
  if (existing) {
    return res.status(403).json({ error: "Department already exists", existing })
  }

  const fac = await req.prisma.department.create({ data: req.body })
  return res.json(fac)
}

export const updateDepartment = async (req: Request<ParamsDictionary, any, DepartmentUpdate>, res: Response) => {
  const fac = await req.prisma.department.update({
    where: { id: req.params.id },
    data: req.body,
  })
  return res.json(fac)
}

export const deleteDepartment = async (req: Request, res: Response) => {
  const fac = await req.prisma.department.delete({
    where: { id: req.params.id },
  })
  return res.json(fac)
}
