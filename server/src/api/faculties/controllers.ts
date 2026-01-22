import { FacultyCreateHandler, FacultyDeleteHandler, FacultyGetHandler, FacultyListHandler, FacultyUpdateHandler, getSortings } from "@planucalgary/shared"
import { FacultyAlreadyExistsError, FacultyNotFoundError } from "./errors";

export const listFaculties: FacultyListHandler = async (req, res) => {
  const { id, name, display_name, code, is_active, sorting } = req.query;
  const whereConditions = {
    ...(id && { id: { contains: id } }),
    ...(name && { name: { contains: name } }),
    ...(display_name && { display_name: { contains: display_name } }),
    ...(code && { code: { contains: code } }),
    ...(is_active !== undefined && { is_active }),
  }
  const [faculties, total] = await Promise.all([
    req.prisma.faculty.findMany({
      where: whereConditions,
      orderBy: getSortings(sorting),
      skip: req.pagination.offset,
      take: req.pagination.limit,
    }),
    req.prisma.faculty.count({
      where: whereConditions,
    }),
  ])

  return res.paginate(faculties, total)
}

export const getFaculty: FacultyGetHandler = async (req, res) => {
  const { id } = req.params;
  const faculty = await req.prisma.faculty.findUnique({
    where: { id },
  })

  if (!faculty) {
    throw new FacultyNotFoundError()
  }

  return res.json(faculty)
}

export const createFaculty: FacultyCreateHandler = async (req, res) => {
  const existing = await req.prisma.faculty.findFirst({
    where: { code: req.body.code },
  })
  if (existing) {
    throw new FacultyAlreadyExistsError()
  }

  const faculty = await req.prisma.faculty.create({
    data: req.body,
  })

  return res.json(faculty)
}

export const updateFaculty: FacultyUpdateHandler = async (req, res) => {
  const faculty = await req.prisma.faculty.update({
    where: { id: req.params.id },
    data: req.body,
  })
  return res.json(faculty)
}

export const deleteFaculty: FacultyDeleteHandler = async (req, res) => {
  await req.prisma.faculty.delete({
    where: { id: req.params.id },
  })
  return res.sendStatus(204)
}
