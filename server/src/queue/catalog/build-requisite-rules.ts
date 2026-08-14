import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { RequisiteRuleValue } from "./types"
import { PrismaClient, RequisiteRule } from "@/generated/prisma/client"
import { DATABASE_URL } from "../../config"


export async function buildRequisiteRules(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })
  const rules = await prisma.requisiteRule.findMany()

  const chunkSize = 50
  const totalRules = rules.length

  for (let i = 0; i < rules.length; i += chunkSize) {
    const chunk = rules.slice(i, i + chunkSize)
    await Promise.all(chunk.map(rule => buildRequisiteRule(rule, prisma)))
    const progress = Math.min(((i + chunkSize) / totalRules) * 100, 100)
    await job.updateProgress(progress)
  }

  await job.updateProgress(100)
  await prisma.$disconnect()
}

function flattenRuleValues(rawJson: RequisiteRuleValue | null | undefined): string[] {
  if (!rawJson?.values) return []

  return rawJson.values.flatMap((v) => {
    if (typeof v === "string") {
      return [v]
    } else if (typeof v === "object" && v !== null && Array.isArray(v.value)) {
      return v.value
    }
    return []
  })
}

async function collectFlattenedValues(rule: { id: string, raw_json: unknown }, prisma: PrismaClient): Promise<string[]> {
  const values = flattenRuleValues(rule.raw_json as any as RequisiteRuleValue)

  const subRules = await prisma.requisiteRule.findMany({
    where: { parent_rule_id: rule.id },
    select: { id: true, raw_json: true },
  })

  for (const subRule of subRules) {
    values.push(...(await collectFlattenedValues(subRule, prisma)))
  }

  return values
}

async function buildRequisiteRule(rule: RequisiteRule, prisma: PrismaClient) {
  try {
    if (rule.condition === "freeformText") {
      return
    }

    const flattenedValues = await collectFlattenedValues(rule, prisma)
    if (flattenedValues.length === 0) return

    const [courses, programs, courseSets, requisiteSets] = await Promise.all([
      prisma.course.findMany({ where: { course_group_id: { in: flattenedValues } }, select: { id: true } }),
      prisma.program.findMany({ where: { program_group_id: { in: flattenedValues } }, select: { id: true } }),
      prisma.courseSet.findMany({ where: { course_set_group_id: { in: flattenedValues } }, select: { id: true } }),
      prisma.requisiteSet.findMany({ where: { requisite_set_group_id: { in: flattenedValues } }, select: { id: true } }),
    ])

    await prisma.requisiteRule.update({
      where: { id: rule.id },
      data: {
        referring_courses: {
          set: courses.map(c => ({ id: c.id })),
        },
        referring_programs: {
          set: programs.map(p => ({ id: p.id })),
        },
        referring_course_sets: {
          set: courseSets.map(cs => ({ id: cs.id })),
        },
        referring_requisite_sets: {
          set: requisiteSets.map(rs => ({ id: rs.id })),
        },
      },
    })
  } catch (error) {
    console.error(error)
  }
}