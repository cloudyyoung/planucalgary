import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { Course, CourseSet, PrismaClient, Program, RequisiteRule, RequisiteSet } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import { DATABASE_URL } from "../../config"
import { DefaultArgs, JsonNull } from "@prisma/client/runtime/client"

interface RequisiteRuleValue {
  id: string
  condition: string
  values: (string | {
    logic: string
    value: string[]
  })[]
}

export interface RequisiteRuleData {
  id: string
  name?: string
  description?: string
  notes?: string
  condition: string
  minCourses?: number
  maxCourses?: number
  minCredits?: number
  maxCredits?: number
  credits?: number
  number?: number
  restriction?: number
  grade?: string
  gradeType?: string
  subRules: RequisiteRuleData[]
  value: RequisiteRuleValue
}

export interface RequisiteData {
  id: string
  name: string
  type: string
  rules: RequisiteRuleData[]
}

export interface RequisiteSetData {
  _id: string
  requisiteSetGroupId: string
  name: string
  description?: string
  requisites?: RequisiteData[]
  effectiveStartDate?: string
  effectiveEndDate?: string
  createdAt?: number
  lastEditedAt?: number
  version: number
}

function camelToSnake(key: string): string {
  return key.replace(/(?<!^)(?=[A-Z])/g, "_").toLowerCase()
}

function convertDictKeysCamelToSnake<T extends Record<string, any>>(d: T | undefined): any {
  if (!d) return d

  const e: Record<string, any> = {}

  for (const [k, v] of Object.entries(d)) {
    e[camelToSnake(k)] = v
  }

  for (const [k, v] of Object.entries(e)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      e[k] = convertDictKeysCamelToSnake(v as Record<string, any>)
    } else if (Array.isArray(v)) {
      e[k] = convertListCamelToSnake(v)
    }
  }

  return e
}

function convertListCamelToSnake(a: any[]): any[] {
  return a.map((i) =>
    i && typeof i === "object" && !Array.isArray(i) ? convertDictKeysCamelToSnake(i as Record<string, any>) : i
  )
}

function processRequisites(requisites: any[] | undefined): any[] {
  if (!requisites) {
    return []
  }

  return convertListCamelToSnake(requisites)
}

/**
 * Process a single requisite upsert
 */
export async function processRequisite(requisiteData: RequisiteData, prisma: PrismaClient): Promise<void> {
  await prisma.requisite.upsert({
    where: { id: requisiteData.id },
    create: {
      id: requisiteData.id,
      name: requisiteData.name,
      type: requisiteData.type,
      raw_rules: processRequisites(requisiteData.rules),
    },
    update: {
      name: requisiteData.name,
      type: requisiteData.type,
      raw_rules: processRequisites(requisiteData.rules),
    },
  })

  await Promise.all(
    (requisiteData.rules.flatMap((rule) => {
      return prisma.requisiteRule.upsert({
        where: { id: rule.id },
        create: {
          id: rule.id,
          requisite_id: requisiteData.id,
          name: rule.name,
          description: rule.description,
          notes: rule.notes,
          condition: rule.condition,
          min_courses: rule.minCourses,
          max_courses: rule.maxCourses,
          min_credits: rule.minCredits,
          max_credits: rule.maxCredits,
          credits: rule.credits,
          number: rule.number,
          restriction: rule.restriction,
          grade: rule.grade,
          grade_type: rule.gradeType,
          raw_json: convertDictKeysCamelToSnake(rule.value),
        },
        update: {
          name: rule.name,
          description: rule.description,
          notes: rule.notes,
          condition: rule.condition,
          min_courses: rule.minCourses,
          max_courses: rule.maxCourses,
          min_credits: rule.minCredits,
          max_credits: rule.maxCredits,
          credits: rule.credits,
          number: rule.number,
          restriction: rule.restriction,
          grade: rule.grade,
          grade_type: rule.gradeType,
          raw_json: convertDictKeysCamelToSnake(rule.value),
        },
      })
    }) ?? [])
  )
}

/**
 * Process a single requisite set upsert
 */
async function processRequisiteSet(requisiteSetData: RequisiteSetData, prisma: PrismaClient): Promise<void> {
  const name = requisiteSetData.name.trim()
  const description = requisiteSetData.description || null
  const rawJson = processRequisites(requisiteSetData.requisites)

  const createdAt = requisiteSetData.createdAt ? new Date(requisiteSetData.createdAt) : new Date()
  const lastEditedAt = requisiteSetData.lastEditedAt ? new Date(requisiteSetData.lastEditedAt) : new Date()
  const effectiveStartDate = requisiteSetData.effectiveStartDate
    ? new Date(requisiteSetData.effectiveStartDate)
    : null
  const effectiveEndDate = requisiteSetData.effectiveEndDate
    ? new Date(requisiteSetData.effectiveEndDate)
    : null

  const data = {
    id: requisiteSetData._id,
    requisite_set_group_id: requisiteSetData.requisiteSetGroupId,
    version: requisiteSetData.version,
    name,
    description,
    raw_json: rawJson,
    requisite_set_created_at: createdAt,
    requisite_set_last_updated_at: lastEditedAt,
    requisite_set_effective_start_date: effectiveStartDate,
    requisite_set_effective_end_date: effectiveEndDate,
  }

  await prisma.requisiteSet.upsert({
    where: { id: data.id },
    create: data,
    update: data,
  })

  if (!requisiteSetData.requisites) {
    return
  }

  await Promise.all(requisiteSetData.requisites.map((req) => processRequisite(req, prisma)))

  await prisma.requisiteSet.update({
    where: { id: data.id },
    data: {
      requisites: {
        set: requisiteSetData.requisites.map((r) => ({ id: r.id })) || [],
      },
    },
  })
}

/**
 * Process requisite set crawl jobs
 */
export async function crawlRequisiteSets(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  // This endpoint does not support limit and skip
  const url = "https://app.coursedog.com/api/v1/ucalgary_peoplesoft/requisite-sets"
  const response = await axios.get<RequisiteSetData[]>(url, {
    headers: {
      Origin: "https://calendar.ucalgary.ca",
    },
    params: {},
    timeout: 60000,
  })

  const requisiteSetsData = response.data

  await job.updateProgress(10)

  // Process requisite sets in parallel batches
  const BATCH_SIZE = 50
  const totalBatches = Math.ceil(requisiteSetsData.length / BATCH_SIZE)
  let totalSucceeded = 0
  let totalFailed = 0

  for (let i = 0; i < requisiteSetsData.length; i += BATCH_SIZE) {
    const batch = requisiteSetsData.slice(i, i + BATCH_SIZE)
    const currentBatch = Math.floor(i / BATCH_SIZE) + 1

    const results = await prisma.$transaction((tx) => {
      return Promise.allSettled(
        batch.map(requisiteSetData => processRequisiteSet(requisiteSetData, tx as PrismaClient))
      )
    })

    // Count successes and failures
    const succeeded = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    totalSucceeded += succeeded
    totalFailed += failed

    // Log any failures
    results.forEach((result, idx) => {
      if (result.status === "rejected") {
        const csid = batch[idx]?._id || "unknown"
        console.error(`Failed to process requisite set ${csid}:`, result.reason)
      }
    })

    // Update progress (10% to 90%)
    const progress = 10 + (currentBatch / totalBatches) * 80
    await job.updateProgress(progress)
  }

  // build relations for all requisite rules
  // await prisma.$transaction(async (tx) => {
  //   const allRules = await tx.requisiteRule.findMany()
  //   console.log(allRules.length)
  //   await Promise.all(
  //     allRules.map((rule) => buildRequisiteRuleRelations(rule, tx))
  //   )
  // })

  await job.updateProgress(100)
  await prisma.$disconnect()

  return {
    total: totalSucceeded + totalFailed,
    totalSucceeded,
    totalFailed,
  }
}

export async function buildRequisiteRuleRelations(rule: RequisiteRule, prisma: Omit<PrismaClient<never, undefined, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) {
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

  return await prisma.requisiteRule.update({
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
