import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"
import { DATABASE_URL } from "../../config"

const TRANSACTION_MAX_WAIT = 1_200_000
const TRANSACTION_TIMEOUT = 1_200_000
const FIELD_OF_STUDY_PREFIX = "Courses Constituting the Field of "

/**
 * Sync fields of study from requisite sets
 */
export async function extractFieldsOfStudy(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const requisiteSets = await prisma.requisiteSet.findMany({
      where: {
        name: { startsWith: FIELD_OF_STUDY_PREFIX },
      },
    })

    await job.updateProgress(10)

    const fields_of_study = requisiteSets.map(async (requisiteSet) => {
      const fieldName = requisiteSet.name.replace(FIELD_OF_STUDY_PREFIX, "").trim()

      return await prisma.fieldOfStudy.upsert({
        where: { name: fieldName },
        create: {
          name: fieldName,
          requisite_set: { connect: { id: requisiteSet.id } },
        },
        update: {
          requisite_set: { connect: { id: requisiteSet.id } },
        },
      })
    })

    const result = await prisma.$transaction(async () => {
      return Promise.allSettled(fields_of_study)
    }, {
      timeout: TRANSACTION_TIMEOUT,
      maxWait: TRANSACTION_MAX_WAIT,
    })

    const count = result.length

    await job.updateProgress(100)

    return {
      message: `${count} fields of study are synced from requisite sets.`,
      affected_rows: count,
    }
  } finally {
    await prisma.$disconnect()
  }
}
