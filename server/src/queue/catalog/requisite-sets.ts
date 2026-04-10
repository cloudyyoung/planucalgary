import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { RequisiteData, RequisiteRuleData, RequisiteSetData } from "./types"
import { PrismaClient } from "@/generated/prisma/client"
import axios from "axios"
import { DATABASE_URL } from "../../config"


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

function convertListCamelToSnake(a: any[] | undefined): any[] | undefined {
  if (!a) return undefined

  return a.map((i) =>
    i && typeof i === "object" && !Array.isArray(i) ? convertDictKeysCamelToSnake(i as Record<string, any>) : i
  )
}

/**
 * Process a single requisite upsert
 */
export async function processRequisite(requisiteData: RequisiteData, prisma: PrismaClient) {
  const requisite = await prisma.requisite.upsert({
    where: { id: requisiteData.id },
    create: {
      id: requisiteData.id,
      name: requisiteData.name,
      type: requisiteData.type,
      raw_rules: convertListCamelToSnake(requisiteData.rules),
    },
    update: {
      name: requisiteData.name,
      type: requisiteData.type,
      raw_rules: convertListCamelToSnake(requisiteData.rules),
    },
  })

  await Promise.all(
    (requisiteData.rules.flatMap((rule) => processRequisiteRule(rule, requisiteData.id, prisma)))
  )

  return requisite
}

async function processRequisiteRule(ruleData: RequisiteRuleData, requisiteId: string, prisma: PrismaClient) {
  const requisiteRule = await prisma.requisiteRule.upsert({
    where: { id: ruleData.id },
    create: {
      id: ruleData.id,
      requisite_id: requisiteId,
      name: ruleData.name,
      description: ruleData.description,
      notes: ruleData.notes,
      condition: ruleData.condition,
      min_courses: ruleData.minCourses,
      max_courses: ruleData.maxCourses,
      min_credits: ruleData.minCredits,
      max_credits: ruleData.maxCredits,
      credits: ruleData.credits,
      number: ruleData.number,
      restriction: ruleData.restriction,
      grade: ruleData.grade,
      grade_type: ruleData.gradeType,
      raw_json: convertDictKeysCamelToSnake(ruleData.value as Record<string, any> | undefined),
    },
    update: {
      name: ruleData.name,
      description: ruleData.description,
      notes: ruleData.notes,
      condition: ruleData.condition,
      min_courses: ruleData.minCourses,
      max_courses: ruleData.maxCourses,
      min_credits: ruleData.minCredits,
      max_credits: ruleData.maxCredits,
      credits: ruleData.credits,
      number: ruleData.number,
      restriction: ruleData.restriction,
      grade: ruleData.grade,
      grade_type: ruleData.gradeType,
      raw_json: convertDictKeysCamelToSnake(ruleData.value as Record<string, any> | undefined),
    },
  })
  return requisiteRule
}

/**
 * Process a single requisite set upsert
 */
async function processRequisiteSet(requisiteSetData: RequisiteSetData, prisma: PrismaClient): Promise<void> {
  const name = requisiteSetData.name.trim()
  const description = requisiteSetData.description || null
  const rawJson = convertListCamelToSnake(requisiteSetData.requisites)

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

  const requisites = await Promise.all(requisiteSetData.requisites.map((rule) => processRequisite(rule, prisma)))

  await prisma.requisiteSet.update({
    where: { id: data.id },
    data: {
      requisites: {
        set: requisites.map((r) => ({ id: r.id })),
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

    // Update progress (10% to 100%)
    const progress = 10 + (currentBatch / totalBatches) * 90
    await job.updateProgress(progress)
  }

  await job.updateProgress(100)
  await prisma.$disconnect()

  return {
    total: totalSucceeded + totalFailed,
    totalSucceeded,
    totalFailed,
  }
}
