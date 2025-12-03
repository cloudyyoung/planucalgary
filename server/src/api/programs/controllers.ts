import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { ProgramCreate, ProgramUpdate, ProgramCreateRelations, ProgramUpdateRelations, ProgramList, ProgramStartTerm } from "@planucalgary/shared"
import { IdInput } from "../../middlewares"
import { Program, Prisma } from "@prisma/client"

export const listPrograms = async (req: Request<any, any, any, ProgramList>, res: Response) => {
  const keywords = req.query.keywords
  const offset = req.pagination.offset
  const limit = req.pagination.limit
  const is_admin = req.account?.is_admin === true

  const getSelectStatement = () => {
    const fields = [
      "id",
      "pid",
      "code",
      "name",
      "long_name",
      "display_name",
      "type",
      "degree_designation_code",
      "degree_designation_name",
      "career",
      "is_active",
      "start_term",
    ]

    if (is_admin) {
      fields.push("requisites")
    }

    return Prisma.sql`select ${Prisma.join(
      fields.map((field) => Prisma.sql`${Prisma.raw(field)}`),
      ", ",
    )} from "catalog"."programs"`
  }

  const getWhereStatement = () => {
    const whereSegments = []
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
      offset ${offset}
      limit ${limit}
    `
  const totalQueryString = Prisma.sql`select count(*)::int from "catalog"."programs" ${whereStatement}`

  const [programs, totalResult] = await Promise.all([
    await req.prisma.$queryRaw<Program[]>(queryString),
    await req.prisma.$queryRaw<[{ count: number }]>(totalQueryString),
  ])
  const total = totalResult[0].count

  return res.paginate(programs, total)
}

export const getProgram = async (req: Request<IdInput>, res: Response) => {
  const program = await req.prisma.program.findUnique({
    where: { id: req.params.id },
    include: {
      departments: true,
      faculties: true,
    },
  })
  return res.json(program)
}

export const createProgram = async (
  req: Request<ParamsDictionary, any, ProgramCreate & ProgramStartTerm & ProgramCreateRelations>,
  res: Response,
) => {
  const existing = await req.prisma.program.findFirst({
    where: { pid: req.body.pid },
  })
  if (existing) {
    return res.status(403).json({ error: "Program with the given pid already exists", existing })
  }

  const program = await req.prisma.program.create({
    data: {
      ...req.body,
      departments: {
        connect: req.body.departments.map((code: string) => ({ code })),
      },
      faculties: {
        connect: req.body.faculties.map((code: string) => ({ code })),
      },
    },
  })
  return res.json(program)
}

export const updateProgram = async (
  req: Request<ParamsDictionary, any, ProgramUpdate & ProgramStartTerm & ProgramUpdateRelations>,
  res: Response,
) => {
  const program = await req.prisma.program.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      departments: {
        connect: req.body.departments?.map((code: string) => ({ code })),
      },
      faculties: {
        connect: req.body.faculties?.map((code: string) => ({ code })),
      },
    },
  })
  return res.json(program)
}

export const deleteProgram = async (req: Request<IdInput>, res: Response) => {
  const program = await req.prisma.program.delete({
    where: { id: req.params.id },
  })
  return res.json(program)
}
