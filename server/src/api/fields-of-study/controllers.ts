import { FieldsOfStudyCreateHandler, FieldsOfStudyDeleteHandler, FieldsOfStudyGetHandler, FieldsOfStudyListHandler, FieldsOfStudyUpdateHandler, getSortings } from "@planucalgary/shared"
import { FieldsOfStudyAlreadyExistsError, FieldsOfStudyNotFoundError } from "./errors";

export const listFieldsOfStudy: FieldsOfStudyListHandler = async (req, res) => {
    const { id, name, description, notes, sorting } = req.query;
    const whereConditions = {
        ...(id && { id: { contains: id } }),
        ...(name && { name: { contains: name } }),
        ...(description && { description: { contains: description } }),
        ...(notes && { notes: { contains: notes } }),
    }
    const [FieldsOfStudy, total] = await Promise.all([
        req.prisma.fieldOfStudy.findMany({
            where: whereConditions,
            orderBy: getSortings(sorting),
            skip: req.pagination.offset,
            take: req.pagination.limit,
        }),
        req.prisma.fieldOfStudy.count({
            where: whereConditions,
        }),
    ])

    return res.paginate(FieldsOfStudy, total)
}

export const getFieldsOfStudy: FieldsOfStudyGetHandler = async (req, res) => {
    const { id } = req.params;
    const FieldsOfStudy = await req.prisma.fieldOfStudy.findUnique({
        where: { id },
    })

    if (!FieldsOfStudy) {
        throw new FieldsOfStudyNotFoundError()
    }

    return res.json(FieldsOfStudy)
}

export const createFieldsOfStudy: FieldsOfStudyCreateHandler = async (req, res) => {
    const existing = await req.prisma.fieldOfStudy.findFirst({
        where: { name: req.body.name },
    })
    if (existing) {
        throw new FieldsOfStudyAlreadyExistsError()
    }

    const FieldsOfStudy = await req.prisma.fieldOfStudy.create({
        data: req.body,
    })

    return res.json(FieldsOfStudy)
}

export const updateFieldsOfStudy: FieldsOfStudyUpdateHandler = async (req, res) => {
    const FieldsOfStudy = await req.prisma.fieldOfStudy.update({
        where: { id: req.params.id },
        data: req.body,
    })
    return res.json(FieldsOfStudy)
}

export const deleteFieldsOfStudy: FieldsOfStudyDeleteHandler = async (req, res) => {
    await req.prisma.fieldOfStudy.delete({
        where: { id: req.params.id },
    })
    return res.sendStatus(204)
}
