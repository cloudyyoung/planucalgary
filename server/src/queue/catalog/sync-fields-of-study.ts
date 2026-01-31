import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@planucalgary/shared/prisma/client"
import { DATABASE_URL } from "../../config"

const TRANSACTION_MAX_WAIT = 1_200_000
const TRANSACTION_TIMEOUT = 1_200_000
const FIELD_OF_STUDY_PREFIX = "Courses Constituting the Field of "

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
 * Sync fields of study from requisite sets
 */
export async function syncFieldsOfStudy(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const [requisiteSets, courseSets] = await Promise.all([
      prisma.requisiteSet.findMany({
        where: {
          name: { startsWith: FIELD_OF_STUDY_PREFIX },
        },
      }),
      prisma.courseSet.findMany({
        select: {
          course_set_group_id: true,
        },
      }),
    ])

    const courseSetIds = courseSets.map((cs) => cs.course_set_group_id)

    await job.updateProgress(10)

    const fields_of_study = requisiteSets.map(async (requisiteSet) => {
      const fieldName = requisiteSet.name.replace(FIELD_OF_STUDY_PREFIX, "").trim()
      const rawJson = requisiteSet.raw_json as any as CDRequisite[]
      const rule = rawJson[0]?.rules[0]

      if (!rule) return

      const notes = rule.notes
      const description = rule.description
      const values = rule.value.values
        .map((v) => v.value)
        .flat()
        .filter((v) => courseSetIds.includes(v))

      return await prisma.fieldOfStudy.upsert({
        where: { name: fieldName },
        create: {
          name: fieldName,
          description: description,
          notes: notes,
          course_sets: {
            connect: values.map((v) => ({ course_set_group_id: v })),
          },
        },
        update: {
          description: description,
          notes: notes,
          course_sets: {
            set: values.map((v) => ({ course_set_group_id: v })),
          },
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
