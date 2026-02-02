import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import { DATABASE_URL } from "../../config"

interface CourseSetData {
  id: string
  courseSetGroupId: string
  name?: string
  description?: string
  type: string // "static" or "dynamic"
  structure?: any
  courseList?: any[]
  dynamicCourseList?: any[]
  createdAt?: number
  lastEditedAt?: number
}

interface PaginatedResponse {
  [key: string]: CourseSetData
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

function processStructure(structure: any): any {
  if (!structure) {
    return { condition: "all", rules: [] }
  }
  return convertDictKeysCamelToSnake(structure)
}

/**
 * Process a single course set upsert
 */
async function processCourseSet(courseSetData: CourseSetData, prisma: PrismaClient): Promise<void> {
  const name = (courseSetData.name || "").trim()
  const description = courseSetData.description || null
  const rawJson = processStructure(courseSetData.structure)

  const createdAt = courseSetData.createdAt
    ? new Date(courseSetData.createdAt)
    : new Date()
  const lastEditedAt = courseSetData.lastEditedAt
    ? new Date(courseSetData.lastEditedAt)
    : new Date()

  const data = {
    csid: courseSetData.id,
    course_set_group_id: courseSetData.courseSetGroupId,
    type: courseSetData.type,
    name,
    description,
    raw_json: rawJson,
    course_set_created_at: createdAt,
    course_set_last_updated_at: lastEditedAt,
  }

  await prisma.courseSet.upsert({
    where: { course_set_group_id: data.course_set_group_id },
    create: data,
    update: data,
  })
}

/**
 * Fetch a single page of course sets
 */
async function fetchCourseSetPage(skip: number, limit: number): Promise<CourseSetData[]> {
  const url = `https://app.coursedog.com/api/v1/cm/ucalgary_peoplesoft/courseSets?skip=${skip}&limit=${limit}`

  const response = await axios.get<PaginatedResponse>(url, {
    headers: {
      Origin: "https://calendar.ucalgary.ca",
    },
    params: {
      effectiveDatesRange: "2026-06-21,2099-01-01",
    },
    timeout: 60000,
  })

  return Object.values(response.data)
}

/**
 * Process course set crawl jobs
 */
export async function crawlCourseSets(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const LIMIT = 2000
    const MAX_PAGES = 99
    let allCourseSets: CourseSetData[] = []

    // Fetch all pages
    await job.updateProgress(5)

    for (let page = 0; page < MAX_PAGES; page++) {
      const skip = page * LIMIT
      const courseSets = await fetchCourseSetPage(skip, LIMIT)

      if (courseSets.length === 0) {
        console.log(`No more course sets to fetch at page ${page}`)
        break
      }

      allCourseSets.push(...courseSets)

      // Update progress during fetch (5% to 25%)
      const fetchProgress = 5 + ((page + 1) / MAX_PAGES) * 20
      await job.updateProgress(fetchProgress)

      // Stop if we got less than the limit (last page)
      if (courseSets.length < LIMIT) {
        console.log(`Fetched last page with ${courseSets.length} course sets`)
        break
      }
    }

    await job.updateProgress(25)

    // Process course sets in parallel batches
    const BATCH_SIZE = 50
    const totalBatches = Math.ceil(allCourseSets.length / BATCH_SIZE)
    let totalSucceeded = 0
    let totalFailed = 0

    for (let i = 0; i < allCourseSets.length; i += BATCH_SIZE) {
      const batch = allCourseSets.slice(i, i + BATCH_SIZE)
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map((courseSet) => processCourseSet(courseSet, prisma))
      )

      // Count successes and failures
      const succeeded = results.filter((r) => r.status === "fulfilled").length
      const failed = results.filter((r) => r.status === "rejected").length

      totalSucceeded += succeeded
      totalFailed += failed

      // Log any failures
      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          const csid = batch[idx]?.id || "unknown"
          console.error(`Failed to process course set ${csid}:`, result.reason)
        }
      })

      // Update progress (25% to 100%)
      const progress = 25 + (currentBatch / totalBatches) * 75
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
