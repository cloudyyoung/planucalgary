import { SubjectCreateHandler, SubjectDeleteHandler, SubjectGetHandler, SubjectListHandler, SubjectUpdateHandler, SubjectCrawlHandler, getSortings } from "@planucalgary/shared"
import { SubjectAlreadyExistsError, SubjectNotFoundError } from "./errors";
import { catalogQueue } from "../../queue/queues";

export const listSubjects: SubjectListHandler = async (req, res) => {
  const { id, code, title, sorting } = req.query;
  const whereConditions = {
    ...(id && { id: { contains: id } }),
    ...(code && { code: { contains: code } }),
    ...(title && { title: { contains: title } }),
  }
  const [subjects, total] = await Promise.all([
    req.prisma.subject.findMany({
      where: whereConditions,
      orderBy: getSortings(sorting),
      skip: req.pagination.offset,
      take: req.pagination.limit,
    }),
    req.prisma.subject.count({
      where: whereConditions,
    }),
  ])

  return res.paginate(subjects, total)
}

export const getSubject: SubjectGetHandler = async (req, res) => {
  const { id } = req.params;
  const subject = await req.prisma.subject.findUnique({
    where: { id },
  })

  if (!subject) {
    throw new SubjectNotFoundError()
  }

  return res.json(subject)
}

export const createSubject: SubjectCreateHandler = async (req, res) => {
  const existing = await req.prisma.subject.findFirst({
    where: { code: req.body.code },
  })

  if (existing) {
    throw new SubjectAlreadyExistsError(existing.id)
  }

  const subject = await req.prisma.subject.create({
    data: {
      ...req.body,
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
    },
  })

  return res.json(subject)
}

export const updateSubject: SubjectUpdateHandler = async (req, res) => {
  const subject = await req.prisma.subject.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
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
    },
  })
  return res.json(subject)
}

export const deleteSubject: SubjectDeleteHandler = async (req, res) => {
  await req.prisma.subject.delete({
    where: { id: req.params.id },
  })
  return res.sendStatus(204)
}

export const crawlSubjects: SubjectCrawlHandler = async (req, res) => {
  await catalogQueue.add("subjects", {})
  return res.sendStatus(202)
}
