import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, RequisiteType } from "@planucalgary/shared/prisma/client"
import _ from "lodash"
import { DATABASE_URL } from "../../config"
import { getValidator } from "../../jsonlogic/requisite_json"

const TRANSACTION_MAX_WAIT = 1_200_000
const TRANSACTION_TIMEOUT = 1_200_000

/**
 * Sync requisites jsons to course sets
 */
export async function syncCourseSets(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const validate = await getValidator()

    const [courseSets, requisitesJsons] = await Promise.all([
      prisma.courseSet.findMany(),
      prisma.requisiteJson.findMany(),
    ])

    await job.updateProgress(10)

    const result = await prisma.$transaction(
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

    await job.updateProgress(100)

    return {
      message: `${courseSets.length} requisites are synced to course sets.`,
      affected_rows: count,
    }
  } finally {
    await prisma.$disconnect()
  }
}
