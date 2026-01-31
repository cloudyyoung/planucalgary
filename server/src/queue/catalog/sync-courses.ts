import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, RequisiteType } from "@planucalgary/shared/prisma/client"
import _ from "lodash"
import { DATABASE_URL } from "../../config"
import { getValidator } from "../../jsonlogic/requisite_json"

/**
 * Sync requisites jsons to courses
 */
export async function syncCourses(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const validate = await getValidator()

    const [courses, requisitesJsons] = await Promise.all([
      prisma.course.findMany({
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
      prisma.requisiteJson.findMany(),
    ])

    await job.updateProgress(10)

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

      return prisma.course.update({
        where: { id },
        data: {
          prereq_json,
          coreq_json,
          antireq_json,
        },
      })
    })

    const result = await prisma.$transaction(course_updates)
    const count = result.length

    await job.updateProgress(100)

    return {
      message: `${courses.length} requisites are synced to courses.`,
      affected_rows: count,
    }
  } finally {
    await prisma.$disconnect()
  }
}
