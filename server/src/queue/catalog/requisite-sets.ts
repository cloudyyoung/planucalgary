import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Requisite } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import { DATABASE_URL } from "../../config"

interface RequisiteRuleData {
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
  value: {
    id: string
    condition: string
    values: (string | {
      logic: string
      value: string[]
    })[]
  }
}

interface RequisiteData {
  id: string
  name: string
  type: string
  rules: RequisiteRuleData[]
}

interface RequisiteSetData {
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

function convertDictKeysCamelToSnake<T extends Record<string, any>>(d: T): any {
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

  // First, upsert all requisites and their rules
  for (const r of requisiteSetData.requisites || []) {
    await prisma.requisite.upsert({
      where: { id: r.id },
      create: {
        id: r.id,
        name: r.name,
        type: r.type,
        rules: {
          createMany: {
            data: r.rules.map((rule) => ({
              id: rule.id,
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
            })),
          },
        },
      },
      update: {
        name: r.name,
        type: r.type,
        rules: {
          deleteMany: {},
          createMany: {
            data: r.rules.map((rule) => ({
              id: rule.id,
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
            })),
          },
        },
      },
    })
  }

  // Then upsert the requisite set and connect only the new requisites
  await prisma.requisiteSet.upsert({
    where: { id: data.id },
    create: {
      ...data,
      requisites: {
        connect: requisiteSetData.requisites?.map((r) => ({ id: r.id })) || [],
      },
    },
    update: {
      ...data,
      requisites: {
        set: [],
        connect: requisiteSetData.requisites?.map((r) => ({ id: r.id })) || [],
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

  try {
    // This endpoint does not support limit and skip
    const url = "https://app.coursedog.com/api/v1/ucalgary_peoplesoft/requisite-sets"
    const response = await axios.get<RequisiteSetData[]>(url, {
      headers: {
        Origin: "https://calendar.ucalgary.ca",
      },
      params: {
        effectiveDatesRange: "2026-06-21,2099-01-01",
      },
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

      // Process batch sequentially within a transaction
      const results = await prisma.$transaction(async (tx) => {
        const batchResults: Array<{ status: "fulfilled" | "rejected"; reason?: any }> = []
        for (const requisiteSet of batch) {
          try {
            await processRequisiteSet(requisiteSet, tx as PrismaClient)
            batchResults.push({ status: "fulfilled" })
          } catch (error) {
            batchResults.push({ status: "rejected", reason: error })
          }
        }
        return batchResults
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

    return {
      total: totalSucceeded + totalFailed,
      totalSucceeded,
      totalFailed,
    }
  } finally {
    await prisma.$disconnect()
  }
}
