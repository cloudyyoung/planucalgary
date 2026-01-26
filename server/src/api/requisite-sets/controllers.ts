import { RequisiteSetCreateHandler, RequisiteSetDeleteHandler, RequisiteSetGetHandler, RequisiteSetListHandler, RequisiteSetUpdateHandler, getSortings } from "@planucalgary/shared"
import { RequisiteSetAlreadyExistsError, RequisiteSetNotFoundError } from "./errors";

export const listRequisiteSets: RequisiteSetListHandler = async (req, res) => {
    const { id, csid, requisite_set_group_id, version, name, description, sorting } = req.query;
    const whereConditions = {
        ...(id && { id: { contains: id } }),
        ...(csid && { csid: { contains: csid } }),
        ...(requisite_set_group_id && { requisite_set_group_id: { contains: requisite_set_group_id } }),
        ...(version !== undefined && { version }),
        ...(name && { name: { contains: name } }),
        ...(description && { description: { contains: description } }),
    }
    const [requisiteSets, total] = await Promise.all([
        req.prisma.requisiteSet.findMany({
            where: whereConditions,
            orderBy: getSortings(sorting),
            skip: req.pagination.offset,
            take: req.pagination.limit,
        }),
        req.prisma.requisiteSet.count({
            where: whereConditions,
        }),
    ])

    return res.paginate(requisiteSets, total)
}

export const getRequisiteSet: RequisiteSetGetHandler = async (req, res) => {
    const { id } = req.params;
    const requisiteSet = await req.prisma.requisiteSet.findUnique({
        where: { id },
    })

    if (!requisiteSet) {
        throw new RequisiteSetNotFoundError()
    }

    return res.json(requisiteSet)
}

export const createRequisiteSet: RequisiteSetCreateHandler = async (req, res) => {
    const existing = await req.prisma.requisiteSet.findFirst({
        where: { requisite_set_group_id: req.body.requisite_set_group_id },
    })
    if (existing) {
        throw new RequisiteSetAlreadyExistsError(existing.id)
    }

    const requisiteSet = await req.prisma.requisiteSet.create({
        data: {
            ...req.body,
            json: req.body.json as any,
            raw_json: req.body.raw_json as any,
        },
    })

    return res.json(requisiteSet)
}

export const updateRequisiteSet: RequisiteSetUpdateHandler = async (req, res) => {
    const requisiteSet = await req.prisma.requisiteSet.update({
        where: { id: req.params.id },
        data: {
            ...req.body,
            json: req.body.json as any,
            raw_json: req.body.raw_json as any,
        },
    })
    return res.json(requisiteSet)
}

export const deleteRequisiteSet: RequisiteSetDeleteHandler = async (req, res) => {
    await req.prisma.requisiteSet.delete({
        where: { id: req.params.id },
    })
    return res.sendStatus(204)
}
