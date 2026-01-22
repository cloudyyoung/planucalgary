import { ProgramCreateHandler, ProgramDeleteHandler, ProgramGetHandler, ProgramListHandler, ProgramListReqQuerySchema, ProgramUpdateHandler, getSortings } from "@planucalgary/shared"
import { ProgramAlreadyExistsError, ProgramNotFoundError } from "./errors"

export const listPrograms: ProgramListHandler = async (req, res) => {
  const { id, code, name, pid, is_active, sorting } = ProgramListReqQuerySchema.parse(req.query);
  const whereConditions = {
    ...(id && { id: { contains: id } }),
    ...(code && { code: { contains: code } }),
    ...(name && { name: { contains: name } }),
    ...(pid && { pid: { contains: pid } }),
    ...(is_active !== undefined && { is_active }),
  }
  const [programs, total] = await Promise.all([
    req.prisma.program.findMany({
      where: whereConditions,
      orderBy: getSortings(sorting),
      skip: req.pagination.offset,
      take: req.pagination.limit,
    }),
    req.prisma.program.count({
      where: whereConditions,
    }),
  ])

  return res.paginate(programs, total)
}

export const getProgram: ProgramGetHandler = async (req, res) => {
  const { id } = req.params;
  const program = await req.prisma.program.findUnique({
    where: { id },
  })

  if (!program) {
    throw new ProgramNotFoundError()
  }

  return res.json(program)
}

export const createProgram: ProgramCreateHandler = async (req, res) => {
  const existing = await req.prisma.program.findFirst({
    where: { pid: req.body.pid as string },
  })
  if (existing) {
    throw new ProgramAlreadyExistsError()
  }

  const program = await req.prisma.program.create({
    data: req.body as any,
  })

  return res.json(program)
}

export const updateProgram: ProgramUpdateHandler = async (req, res) => {
  const program = await req.prisma.program.update({
    where: { id: req.params.id },
    data: req.body as any,
  })
  return res.json(program)
}

export const deleteProgram: ProgramDeleteHandler = async (req, res) => {
  await req.prisma.program.delete({
    where: { id: req.params.id },
  })
  return res.sendStatus(204)
}

