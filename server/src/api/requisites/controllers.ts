import { RequisiteGenerateChoicesHandler, RequisiteGetHandler, RequisiteListHandler, RequisitesSyncHandler, RequisiteUpdateHandler, getSortings, } from "@planucalgary/shared"

import { generatePrereq } from "../utils/openai"
import { cleanup, isJsonEqual } from "../../jsonlogic/utils"
import { getValidator } from "../../jsonlogic/requisite_json"
import { toCourses, toCourseSets, toRequisitesJson } from "./sync"
import { InvalidRequisiteJsonError, InvalidSyncDestinationError, RequisiteNotFoundError } from "./errors"

export const listRequisites: RequisiteListHandler = async (req, res) => {
  const { requisite_type, sorting } = req.query
  const [requisites, total, validate] = await Promise.all([
    req.prisma.requisiteJson.findMany({
      where: {
        ...(requisite_type && { requisite_type }),
      },
      orderBy: sorting ? getSortings(sorting) : { id: "asc" },
      skip: req.pagination.offset,
      take: req.pagination.limit,
    }),
    req.prisma.requisiteJson.count({
      where: {
        ...(requisite_type && { requisite_type }),
      },
    }),
    getValidator(),
  ])

  const requisitesValidated = requisites.map((requisite) => {
    const validation = validate(requisite.json)
    return {
      ...requisite,
      ...validation,
    }
  })
  return res.paginate(requisitesValidated, total)
}

export const getRequisite: RequisiteGetHandler = async (req, res) => {
  const requisite = await req.prisma.requisiteJson.findUnique({
    where: { id: req.params.id },
  })

  if (!requisite) {
    throw new RequisiteNotFoundError()
  }

  const validate = await getValidator()
  const validation = validate(requisite.json)
  const response = {
    ...requisite,
    ...validation,
  }
  return res.json(response)
}

export const updateRequisite: RequisiteUpdateHandler = async (req, res) => {
  const existing = await req.prisma.requisiteJson.findUnique({
    where: { id: req.params.id },
  })

  if (!existing) {
    throw new RequisiteNotFoundError()
  }

  if (!!req.body.json) {
    const validate = await getValidator()
    const json = req.body.json
    const { json_valid } = validate(json)

    if (!json_valid) {
      throw new InvalidRequisiteJsonError()
    }
  }

  const requisite = await req.prisma.requisiteJson.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      json: req.body.json as any,
      json_choices: req.body.json_choices as any,
    },
  })
  return res.json(requisite)
}

export const generateRequisiteChoices: RequisiteGenerateChoicesHandler = async (req, res) => {
  const existing = await req.prisma.requisiteJson.findUnique({
    where: { id: req.params.id },
  })

  if (!existing) {
    throw new RequisiteNotFoundError()
  }

  const text = existing.text
  const type = existing.requisite_type
  const department = existing.departments[0] ?? "None"
  const faculty = existing.faculties[0] ?? "None"
  const choices = await generatePrereq(text, type, department, faculty, 3)
  const json_parsed = JSON.parse(JSON.stringify(choices))
  const json_cleaned = json_parsed.map(cleanup)
  const json_choices = json_cleaned

  // Deeply compare all choices if they are the same, if so, automatically select the first choice
  const allEqual = json_choices.every((choice: JSON) => isJsonEqual(choice, json_choices[0]))

  const updated = await req.prisma.requisiteJson.update({
    where: { id: req.params.id },
    data: { json_choices, json: allEqual ? json_choices[0] : existing.json },
  })
  return res.json(updated)
}

export const syncRequisites: RequisitesSyncHandler = async (req, res, next) => {
  const destination = req.body.destination
  if (destination === "requisites_jsons") {
    toRequisitesJson(req, res, next)
  } else if (destination === "courses") {
    toCourses(req, res, next)
  } else if (destination === "course_sets") {
    toCourseSets(req, res, next)
  }

  throw new InvalidSyncDestinationError()
}
