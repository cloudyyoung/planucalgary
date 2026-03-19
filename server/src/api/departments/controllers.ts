import { DepartmentCreateHandler, DepartmentDeleteHandler, DepartmentGetHandler, DepartmentListHandler, DepartmentUpdateHandler, getSortings } from "@planucalgary/shared"
import { DepartmentAlreadyExistsError, DepartmentNotFoundError } from "./errors";

export const listDepartments: DepartmentListHandler = async (req, res) => {
  const { name, display_name, code, is_active, sorting } = req.query;
  const whereConditions = { name, display_name, code, is_active, }
  const [departments, total] = await Promise.all([
    req.prisma.department.findMany({
      where: whereConditions,
      orderBy: getSortings(sorting),
      skip: req.pagination.offset,
      take: req.pagination.limit,
    }),
    req.prisma.department.count({
      where: whereConditions,
    }),
  ])

  return res.paginate(departments, total)
}

export const getDepartment: DepartmentGetHandler = async (req, res) => {
  const department = await req.prisma.department.findUnique({
    where: { code: req.params.code },
  })

  if (!department) {
    throw new DepartmentNotFoundError()
  }

  return res.json(department)
}

export const createDepartment: DepartmentCreateHandler = async (req, res) => {
  const existing = await req.prisma.department.findFirst({
    where: { code: req.body.code },
  })

  if (existing) {
    throw new DepartmentAlreadyExistsError(existing.code)
  }

  const department = await req.prisma.department.create({
    data: req.body,
  })

  return res.json(department)
}

export const updateDepartment: DepartmentUpdateHandler = async (req, res) => {
  const department = await req.prisma.department.update({
    where: { code: req.params.code },
    data: req.body,
  })
  return res.json(department)
}

export const deleteDepartment: DepartmentDeleteHandler = async (req, res) => {
  await req.prisma.department.delete({
    where: { code: req.params.code },
  })
  return res.sendStatus(204)
}
