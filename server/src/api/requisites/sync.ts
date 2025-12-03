import { Request, Response } from "express"
import { RequisiteType, Prisma } from "@prisma/client"
import _ from "lodash"
import { RequisiteJsonCreate } from "@planucalgary/shared"

import { getValidator } from "../../jsonlogic/requisite_json"

export const toRequisitesJson = async (req: Request, res: Response) => {
  const [courses, courseSets] = await Promise.all([
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
  ])

  const courses_requisites_jsons = courses.flatMap((course) => {
    const { prereq, coreq, antireq, departments, faculties } = course
    const department_codes = departments.map((d) => d.code)
    const faculty_codes = faculties.map((f) => f.code)

    const requisites_jsons: RequisiteJsonCreate[] = []

    if (prereq) {
      requisites_jsons.push({
        requisite_type: RequisiteType.PREREQ,
        text: prereq,
        departments: department_codes,
        faculties: faculty_codes,
        json: Prisma.DbNull,
        json_choices: [],
      })
    }
    if (coreq) {
      requisites_jsons.push({
        requisite_type: RequisiteType.COREQ,
        text: coreq,
        departments: department_codes,
        faculties: faculty_codes,
        json: Prisma.DbNull,
        json_choices: [],
      })
    }
    if (antireq) {
      requisites_jsons.push({
        requisite_type: RequisiteType.ANTIREQ,
        text: antireq,
        departments: department_codes,
        faculties: faculty_codes,
        json: Prisma.DbNull,
        json_choices: [],
      })
    }
    return requisites_jsons
  })

  const course_sets_requisites_json = courseSets.flatMap((courseSet) => {
    const { name } = courseSet
    return {
      requisite_type: RequisiteType.COURSE_SET,
      text: name,
      departments: [],
      faculties: [],
      json: Prisma.DbNull,
      json_choices: [],
    }
  })

  const requisites_jsons = [...courses_requisites_jsons, ...course_sets_requisites_json]

  const result = await req.prisma.requisiteJson.createMany({
    data: requisites_jsons,
    skipDuplicates: true,
  })

  const count = result.count

  return res.status(200).json({
    message: `${count} requisites are added to requisites_jsons.`,
    courses_requisites: courses_requisites_jsons.length,
    course_sets_requisites: course_sets_requisites_json.length,
    new_requisites: count,
  })
}

export const toCourses = async (req: Request, res: Response) => {
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
          prereq_json = requisite.json ?? Prisma.DbNull
        } else {
          prereq_json = Prisma.DbNull
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
          coreq_json = requisite.json ?? Prisma.DbNull
        } else {
          coreq_json = Prisma.DbNull
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
          antireq_json = requisite.json ?? Prisma.DbNull
        } else {
          antireq_json = Prisma.DbNull
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

  return res.status(200).json({
    message: `${courses.length} requisites are synced to courses.`,
    courses_synced: count,
  })
}

export const toCourseSets = async (req: Request, res: Response) => {
  const validate = await getValidator()

  const [courseSets, requisitesJsons] = await Promise.all([
    req.prisma.courseSet.findMany(),
    req.prisma.requisiteJson.findMany(),
  ])

  const course_set_updates = courseSets.flatMap((courseSet) => {
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
      req.prisma.courseSet.update({
        where: { id },
        data: {
          json: requisite.json ?? Prisma.DbNull,
        },
      }),
    ]
  })

  const result = await req.prisma.$transaction(course_set_updates)
  const count = result.filter((r) => r !== null).length

  return res.status(200).json({
    message: `${courseSets.length} requisites are synced to course sets.`,
    course_sets_synced: count,
  })
}
