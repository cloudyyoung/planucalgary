import { ProgramCreateHandler, ProgramDeleteHandler, ProgramGetHandler, ProgramListHandler, ProgramListReqQuerySchema, ProgramUpdateHandler, ProgramCrawlHandler, getSortings } from "@planucalgary/shared"
import { ProgramAlreadyExistsError, ProgramNotFoundError } from "./errors"
import { catalogQueue } from "../../queue/queues"

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
      include: {
        faculties: true,
        departments: true,
      },
      where: whereConditions,
      orderBy: [...getSortings(sorting), { is_active: "desc" }, { code: "desc" }],
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
    include: {
      faculties: true,
      departments: true,
    },
    where: { id },
  })

  if (!program) {
    throw new ProgramNotFoundError()
  }

  return res.json(program)
}

export const createProgram: ProgramCreateHandler = async (req, res) => {
  const existing = await req.prisma.program.findFirst({
    where: { program_group_id: req.body.program_group_id as string },
  })

  if (existing) {
    throw new ProgramAlreadyExistsError(existing.id)
  }

  const program = await req.prisma.program.create({
    data: {
      ...req.body,
      faculties: {
        connectOrCreate: req.body.faculties?.map(code => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
      departments: {
        connectOrCreate: req.body.departments?.map(code => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
      requisites: req.body.requisites as any,
      start_term: req.body.start_term as any,
    },
  })

  return res.json(program)
}

export const updateProgram: ProgramUpdateHandler = async (req, res) => {
  const program = await req.prisma.program.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      faculties: {
        set: [],
        connectOrCreate: req.body.faculties?.map(code => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
      departments: {
        set: [],
        connectOrCreate: req.body.departments?.map(code => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
      requisites: req.body.requisites as any,
      start_term: req.body.start_term as any,
    },
  })
  return res.json(program)
}

export const deleteProgram: ProgramDeleteHandler = async (req, res) => {
  await req.prisma.program.delete({
    where: { id: req.params.id },
  })
  return res.sendStatus(204)
}

export const crawlPrograms: ProgramCrawlHandler = async (req, res) => {
  await catalogQueue.add("programs", {})
  return res.sendStatus(202)
}

