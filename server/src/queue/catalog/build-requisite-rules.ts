import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { RequisiteRuleValue } from "@planucalgary/shared"
import { PrismaClient, RequisiteRule } from "@planucalgary/shared/prisma/client"
import { DATABASE_URL } from "../../config"


export async function buildRequisiteRules(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })
  const rules = await prisma.requisiteRule.findMany()

  const chunkSize = 100
  const totalRules = rules.length
  for (let i = 0; i < rules.length; i += chunkSize) {
    const chunk = rules.slice(i, i + chunkSize)
    await Promise.all(chunk.map(rule => buildRequisiteRule(rule, prisma)))
    job.updateProgress(Math.min(((i + chunkSize) / totalRules) * 100, 100))
  }
  job.updateProgress(100)

  prisma.$disconnect()
}

async function buildRequisiteRule(rule: RequisiteRule, prisma: PrismaClient) {
  if (!rule.raw_json) return

  const rawJson = rule.raw_json as any as RequisiteRuleValue
  const values = rawJson.values
  const flattenedValues: string[] = values.flatMap((v) => {
    if (typeof v === "string") {
      return [v]
    } else if (typeof v === "object" && v.logic && Array.isArray(v.value)) {
      return v.value
    }
    return []
  })

  await prisma.requisiteRule.update({
    where: { id: rule.id },
    data: {
      referring_courses: {
        set: flattenedValues.map(id => ({ course_group_id: id })),
      },
      referring_programs: {
        set: flattenedValues.map(id => ({ program_group_id: id })),
      },
      referring_course_sets: {
        set: flattenedValues.map(id => ({ course_set_group_id: id })),
      },
      referring_requisite_sets: {
        set: flattenedValues.map(id => ({ requisite_set_group_id: id })),
      },
    },
  })
}