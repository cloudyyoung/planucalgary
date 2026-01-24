import { Request, Response } from "express"
import { RequisiteType } from "@planucalgary/shared/prisma/client"
import _ from "lodash"
import { RequisitesSyncHandler } from "@planucalgary/shared"

import { getValidator } from "../../jsonlogic/requisite_json"

const TRANSACTION_MAX_WAIT = 1_200_000
const TRANSACTION_TIMEOUT = 1_200_000

export const toRequisitesJson: RequisitesSyncHandler = async (req, res, next) => {
  const [courses, courseSets, requisiteSets] = await Promise.all([
    req.prisma.course.findMany({
      select: {
        prereq: true,
        coreq: true,
        antireq: true,
        departments: {
          select: {
            code: true,
          },
        },
        faculties: {
          select: {
            code: true,
          },
        },
      },
      where: {
        is_active: true,
      },
    }),
    req.prisma.courseSet.findMany(),
    req.prisma.requisiteSet.findMany(),
  ])

  const courses_requisites_jsons = courses.flatMap((course) => {
    const { prereq, coreq, antireq, departments, faculties } = course
    const department_codes = departments.map((d) => d.code)
    const faculty_codes = faculties.map((f) => f.code)

    const requisites_jsons = []

    if (prereq) {
      requisites_jsons.push({
        requisite_type: RequisiteType.PREREQ,
        text: prereq,
        departments: department_codes,
        faculties: faculty_codes,
        json: undefined,
        json_choices: [],
      })
    }
    if (coreq) {
      requisites_jsons.push({
        requisite_type: RequisiteType.COREQ,
        text: coreq,
        departments: department_codes,
        faculties: faculty_codes,
        json: undefined,
        json_choices: [],
      })
    }
    if (antireq) {
      requisites_jsons.push({
        requisite_type: RequisiteType.ANTIREQ,
        text: antireq,
        departments: department_codes,
        faculties: faculty_codes,
        json: undefined,
        json_choices: [],
      })
    }
    return requisites_jsons
  })

  const course_sets_requisites_json = courseSets.flatMap((courseSet) => {
    const { name, raw_json } = courseSet
    return req.prisma.requisiteJson.upsert({
      where: {
        requisite_type_text_departments_faculties: {
          requisite_type: RequisiteType.COURSE_SET,
          text: name,
          departments: [],
          faculties: [],
        }
      },
      create: {
        requisite_type: RequisiteType.COURSE_SET,
        text: name,
        departments: [],
        faculties: [],
        raw_json: raw_json as any,
      },
      update: {
        raw_json: raw_json as any,
      },
    })
  })

  const requisite_sets_requisites_json = requisiteSets.flatMap((requisiteSet) => {
    const { name, raw_json } = requisiteSet
    return req.prisma.requisiteJson.upsert({
      where: {
        requisite_type_text_departments_faculties: {
          requisite_type: RequisiteType.REQUISITE_SET,
          text: name,
          departments: [],
          faculties: [],
        }
      },
      create: {
        requisite_type: RequisiteType.REQUISITE_SET,
        text: name,
        departments: [],
        faculties: [],
        raw_json: raw_json as any,
      },
      update: {
        raw_json: raw_json as any,
      },
    })
  })

  await req.prisma.$transaction(async (tx) => {
    await Promise.all([
      tx.requisiteJson.createMany({
        data: courses_requisites_jsons,
        skipDuplicates: true,
      }),
      ...course_sets_requisites_json,
      ...requisite_sets_requisites_json,
    ])
  }, {
    timeout: TRANSACTION_TIMEOUT,
    maxWait: TRANSACTION_MAX_WAIT,
  })

  const count = courses_requisites_jsons.length + courseSets.length + requisiteSets.length

  return res.json({
    message: `${count} requisites are added to requisites_jsons.`,
    affected_rows: count,
  })
}

export const toCourses: RequisitesSyncHandler = async (req, res) => {
  const validate = await getValidator()

  const [courses, requisitesJsons] = await Promise.all([
    req.prisma.course.findMany({
      select: {
        id: true,
        prereq: true,
        coreq: true,
        antireq: true,
        departments: {
          select: {
            code: true,
          },
        },
        faculties: {
          select: {
            code: true,
          },
        },
      },
      where: {
        is_active: true,
      },
    }),
    req.prisma.requisiteJson.findMany(),
  ])

  const course_updates = courses.map((course) => {
    const { id, prereq, coreq, antireq, departments, faculties } = course
    const department_codes = departments.map((d) => d.code)
    const faculty_codes = faculties.map((f) => f.code)

    let prereq_json
    let coreq_json
    let antireq_json

    if (prereq) {
      const requisite = requisitesJsons.find(
        (r) =>
          r.requisite_type === RequisiteType.PREREQ &&
          r.text === prereq &&
          _.isEqual(r.departments, department_codes) &&
          _.isEqual(r.faculties, faculty_codes),
      )

      if (requisite) {
        if (validate(requisite.json)) {
          prereq_json = requisite.json ?? undefined
        } else {
          prereq_json = undefined
        }
      }
    }

    if (coreq) {
      const requisite = requisitesJsons.find(
        (r) =>
          r.requisite_type === RequisiteType.COREQ &&
          r.text === coreq &&
          _.isEqual(r.departments, department_codes) &&
          _.isEqual(r.faculties, faculty_codes),
      )

      if (requisite) {
        if (validate(requisite.json)) {
          coreq_json = requisite.json ?? undefined
        } else {
          coreq_json = undefined
        }
      }
    }

    if (antireq) {
      const requisite = requisitesJsons.find(
        (r) =>
          r.requisite_type === RequisiteType.ANTIREQ &&
          r.text === antireq &&
          _.isEqual(r.departments, department_codes) &&
          _.isEqual(r.faculties, faculty_codes),
      )

      if (requisite) {
        if (validate(requisite.json)) {
          antireq_json = requisite.json ?? undefined
        } else {
          antireq_json = undefined
        }
      }
    }

    return req.prisma.course.update({
      where: { id },
      data: {
        prereq_json,
        coreq_json,
        antireq_json,
      },
    })
  })

  const result = await req.prisma.$transaction(course_updates)
  const count = result.length

  return res.json({
    message: `${courses.length} requisites are synced to courses.`,
    affected_rows: count,
  })
}

export const toCourseSets: RequisitesSyncHandler = async (req, res) => {
  const validate = await getValidator()

  const [courseSets, requisitesJsons] = await Promise.all([
    req.prisma.courseSet.findMany(),
    req.prisma.requisiteJson.findMany(),
  ])

  const result = await req.prisma.$transaction(
    async (tx) => {
      const updates = courseSets.flatMap((courseSet) => {
        const { id, name } = courseSet

        const requisite = requisitesJsons.find(
          (r) =>
            r.requisite_type === RequisiteType.COURSE_SET &&
            r.text === name &&
            _.isEmpty(r.departments) &&
            _.isEmpty(r.faculties),
        )

        if (!requisite) return []
        if (!validate(requisite.json)) return []

        return [
          tx.courseSet.update({
            where: { id },
            data: { json: requisite.json as any },
          }),
        ]
      })

      return Promise.all(updates)
    },
    {
      timeout: TRANSACTION_TIMEOUT,
      maxWait: TRANSACTION_MAX_WAIT,
    },
  )
  const count = result.filter((r) => r !== null).length

  return res.json({
    message: `${courseSets.length} requisites are synced to course sets.`,
    affected_rows: count,
  })
}
