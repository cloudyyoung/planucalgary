import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, RequisiteType } from "@planucalgary/shared/prisma/client"
import { DATABASE_URL } from "../../config"

const TRANSACTION_MAX_WAIT = 1_200_000
const TRANSACTION_TIMEOUT = 1_200_000

interface CDRequisite {
  id: string
  name: string
  type: string
  rules: {
    id: string
    name: string
    condition: string
    value: {
      values: {
        logic: string
        value: string[]
      }[]
    }
    notes?: string
    description?: string
  }[]
}

/**
 * Sync requisites jsons from courses, course sets, and requisite sets
 */
export async function syncRequisitesJsons(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const [courses, courseSets, requisiteSets] = await Promise.all([
      prisma.course.findMany({
        select: {
          prereq: true,
          coreq: true,
          antireq: true,
          raw_json: true,
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
      prisma.courseSet.findMany(),
      prisma.requisiteSet.findMany(),
    ])

    await job.updateProgress(10)

    const courses_requisites_jsons = courses.flatMap((course) => {
      const { prereq, coreq, antireq, departments, faculties, raw_json } = course
      const department_codes = departments.map((d) => d.code)
      const faculty_codes = faculties.map((f) => f.code)

      const requisites_jsons = []

      const raw_json_array: CDRequisite[] = Array.isArray(raw_json) ? raw_json as any : []
      const prereq_raw_json = raw_json_array.find((r) => r.type === "Prerequisite")
      const coreq_raw_json = raw_json_array.find((r) => r.type === "Corequisite")
      const antireq_raw_json = raw_json_array.find((r) => r.type === "Antirequisite")

      if (prereq) {
        requisites_jsons.push(prisma.requisiteJson.upsert({
          where: {
            requisite_type_text_departments_faculties: {
              requisite_type: RequisiteType.PREREQ,
              text: prereq,
              departments: department_codes,
              faculties: faculty_codes,
            },
          },
          create: {
            requisite_type: RequisiteType.PREREQ,
            text: prereq,
            departments: department_codes,
            faculties: faculty_codes,
            raw_json: prereq_raw_json as any,
          },
          update: {
            raw_json: prereq_raw_json as any,
          },
        }))
      }

      if (coreq) {
        requisites_jsons.push(prisma.requisiteJson.upsert({
          where: {
            requisite_type_text_departments_faculties: {
              requisite_type: RequisiteType.COREQ,
              text: coreq,
              departments: department_codes,
              faculties: faculty_codes,
            },
          },
          create: {
            requisite_type: RequisiteType.COREQ,
            text: coreq,
            departments: department_codes,
            faculties: faculty_codes,
            raw_json: coreq_raw_json as any,
          },
          update: {
            raw_json: coreq_raw_json as any,
          },
        }))
      }

      if (antireq) {
        requisites_jsons.push(prisma.requisiteJson.upsert({
          where: {
            requisite_type_text_departments_faculties: {
              requisite_type: RequisiteType.ANTIREQ,
              text: antireq,
              departments: department_codes,
              faculties: faculty_codes,
            },
          },
          create: {
            requisite_type: RequisiteType.ANTIREQ,
            text: antireq,
            departments: department_codes,
            faculties: faculty_codes,
            raw_json: antireq_raw_json as any,
          },
          update: {
            raw_json: antireq_raw_json as any,
          },
        }))
      }

      return requisites_jsons
    })

    const course_sets_requisites_json = courseSets.flatMap((courseSet) => {
      const { name, raw_json } = courseSet
      return prisma.requisiteJson.upsert({
        where: {
          requisite_type_text_departments_faculties: {
            requisite_type: RequisiteType.COURSE_SET,
            text: name,
            departments: [],
            faculties: [],
          },
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
      return prisma.requisiteJson.upsert({
        where: {
          requisite_type_text_departments_faculties: {
            requisite_type: RequisiteType.REQUISITE_SET,
            text: name,
            departments: [],
            faculties: [],
          },
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

    await prisma.$transaction(async () => {
      await Promise.allSettled([
        ...courses_requisites_jsons,
        ...course_sets_requisites_json,
        ...requisite_sets_requisites_json,
      ])
    }, {
      timeout: TRANSACTION_TIMEOUT,
      maxWait: TRANSACTION_MAX_WAIT,
    })

    await job.updateProgress(100)

    const count = courses_requisites_jsons.length + courseSets.length + requisiteSets.length

    return {
      message: `${count} requisites are added to requisites_jsons.`,
      affected_rows: count,
    }
  } finally {
    await prisma.$disconnect()
  }
}
