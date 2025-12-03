import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { SubjectCreate, SubjectUpdate } from "@planucalgary/shared"

export const listSubjects = async (req: Request, res: Response) => {
  const subjects = await req.prisma.subject.findMany()
  return res.json(subjects)
}

export const getSubject = async (req: Request, res: Response) => {
  const subject = await req.prisma.subject.findUnique({
    where: { id: req.params.id },
    include: {
      departments: true,
      courses: true,
    },
  })
  return res.json(subject)
}

export const createSubject = async (req: Request<ParamsDictionary, any, SubjectCreate>, res: Response) => {
  const existing = await req.prisma.subject.findFirst({
    where: { code: req.body.code },
  })
  if (existing) {
    return res.status(403).json({ error: "Subject already exists", existing })
  }

  const subject = await req.prisma.subject.create({ data: req.body })
  return res.json(subject)
}

export const updateSubject = async (req: Request<ParamsDictionary, any, SubjectUpdate>, res: Response) => {
  const subject = await req.prisma.subject.update({
    where: { id: req.params.id },
    data: req.body,
  })
  return res.json(subject)
}

export const deleteSubject = async (req: Request, res: Response) => {
  const subject = await req.prisma.subject.delete({
    where: { id: req.params.id },
  })
  return res.json(subject)
}
