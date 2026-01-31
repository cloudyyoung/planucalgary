import { Job } from "bullmq"
import { createWorker, activeWorkers } from "../config"
import { CourseCrawlJobData } from "../queues/course-crawl.queue"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Career, CourseComponent } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import { GradeMode } from "@planucalgary/shared/prisma/client"
import { DATABASE_URL } from "../../config"

interface CourseData {
  _id: string
  id: string
  career: string
  code: string
  college: string
  components: { code: string }[]
  departments: string[]
  courseGroupId: string
  courseNumber: string
  createdAt: number
  credits: {
    repeatable: boolean
    numberOfRepeats: number
    numberOfCredits: number
  }
  customFields: {
    rawCourseId: string
    lastMultiTermCourse: boolean
  }
  deprecatedCourseGroupId: string | null
  description: string
  effectiveStartDate: string
  gradeMode: string
  lastEditedAt: number
  longName: string
  name: string
  notes: string
  requisites: any
  sisId: string
  startTerm: {
    year: string
    id: string
    semester: number
  }
  status: string
  subjectCode: string
  topics: {
    id: string
    code: string
    name: string
    longName: string
    description: string
    repeatable: boolean
    numberOfCredits: number
    link: string
  }[]
  version: number
  orderByKeyForCode: string
}

const PREREQ_TEXT = "Prerequisite(s): "
const COREQ_TEXT = "Corequisite(s): "
const ANTIREQ_TEXT = "Antirequisite(s): "
const NOTES_TEXT = "Notes: "
const NOTES_TEXT_ALT = "NOte: "
const NOGPA_TEXT = "Not included in GPA"
const AKA_TEXT = "Also known as: "

const processFacultyCode = (college: string) => {
  if (!college) return null

  if (!college.includes(" - ")) {
    return college
  }

  return college.split(" - ")[0].trim()
}

const processTopics = (topics: CourseData["topics"]) => {
  return topics.map((topic) => ({
    number: topic.code,
    name: topic.name,
    long_name: topic.longName,
    description: topic.description,
    is_repeatable: topic.repeatable,
    units: topic.numberOfCredits,
    link: topic.link,
  }))
}

function filterDepartments(departments: CourseData["departments"]): string[] {
  return departments.filter((d) => d.length > 2 && d !== "UCALG")
}

function processDescription(descriptionParagraph: CourseData["description"]) {
  let description: string | null = null
  let prereq: string | null = null
  let coreq: string | null = null
  let antireq: string | null = null
  let notes: string | null = null
  let aka: string | null = null
  let nogpa: boolean | null = null

  if (descriptionParagraph) {
    const normalized = descriptionParagraph.replace(/\n/g, "\n\n")

    const [first, ...more] = normalized.split("\n\n")
    description = first ?? null

    for (const t of more) {
      if (t.startsWith(PREREQ_TEXT)) {
        prereq = t.replace(PREREQ_TEXT, "").trim()
      } else if (t.startsWith(COREQ_TEXT)) {
        coreq = t.replace(COREQ_TEXT, "").trim()
      } else if (t.startsWith(ANTIREQ_TEXT)) {
        antireq = t.replace(ANTIREQ_TEXT, "").trim()
      } else if (t.startsWith(NOTES_TEXT) || t.startsWith(NOTES_TEXT_ALT)) {
        notes = t.replace(NOTES_TEXT, "").replace(NOTES_TEXT_ALT, "").trim()
      } else if (t.startsWith(AKA_TEXT)) {
        aka = t.replace(AKA_TEXT, "").trim()
      }
    }

    nogpa = descriptionParagraph.toUpperCase().includes(NOGPA_TEXT.toUpperCase())
  }

  if (!nogpa) {
    nogpa = false
  }

  return [description, prereq, coreq, antireq, notes, aka, nogpa] as const
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

function componentSerializer(componentAbbr: string): CourseComponent {
  switch (componentAbbr) {
    case "LEC":
      return CourseComponent.LECTURE
    case "TUT":
      return CourseComponent.TUTORIAL
    case "LAB":
      return CourseComponent.LAB
    case "SEM":
      return CourseComponent.SEMINAR
    case "SEC":
      return CourseComponent.SECTION
    default:
      throw new Error(`Unknown component abbreviation: ${componentAbbr}`)
  }
}

function careerSerializer(career: string): Career {
  switch (career) {
    case "Undergraduate Programs":
      return Career.UNDERGRADUATE_PROGRAM
    case "Graduate Programs":
      return Career.GRADUATE_PROGRAM
    case "Medicine Programs":
      return Career.MEDICINE_PROGRAM
    default:
      throw new Error(`Unknown career: ${career}`)
  }
}

/**
 * Process a single course upsert
 */
async function processSingleCourse(
  courseData: CourseData,
  prisma: PrismaClient
): Promise<void> {
  const topics = processTopics(courseData.topics)
  const [description, prereq, coreq, antireq, notes, aka, nogpa] = processDescription(
    courseData.description
  )
  const facultyCode = processFacultyCode(courseData.college)
  const faculties = facultyCode ? [facultyCode] : []
  const departments = filterDepartments(courseData.departments)
  const components = courseData.components.map((c) => componentSerializer(c.code))
  const career = careerSerializer(courseData.career)
  const rawJson = convertDictKeysCamelToSnake(courseData.requisites)

  const data = {
    cid: courseData.courseGroupId,
    code: courseData.code,
    course_number: courseData.courseNumber,
    subject: {
      connectOrCreate: {
        where: { code: courseData.subjectCode },
        create: { code: courseData.subjectCode, title: courseData.subjectCode },
      },
    },
    description: description,
    name: courseData.name,
    long_name: courseData.longName,
    notes: notes,
    version: courseData.version,
    units: courseData.credits.numberOfCredits,
    aka: aka,
    prereq: prereq,
    coreq: coreq,
    antireq: antireq,
    is_active: courseData.status === "Active",
    is_multi_term: courseData.customFields.lastMultiTermCourse,
    is_no_gpa: nogpa,
    is_repeatable: courseData.credits.repeatable,
    components: components,
    course_group_id: courseData.customFields.rawCourseId,
    coursedog_id: courseData._id,
    course_created_at: new Date(courseData.createdAt),
    course_effective_start_date: new Date(courseData.effectiveStartDate),
    course_last_updated_at: new Date(courseData.lastEditedAt),
    grade_mode: GradeMode.CRF,
    career: career,
    raw_json: rawJson,
  }

  await prisma.course.upsert({
    where: { course_group_id: data.course_group_id, cid: data.cid },
    create: {
      ...data,
      departments: {
        connectOrCreate: departments.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
      faculties: {
        connectOrCreate: faculties.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
      topics: { create: topics },
    },
    update: {
      ...data,
      departments: {
        connectOrCreate: departments.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
        set: departments.map((code) => ({ code })),
      },
      faculties: {
        connectOrCreate: facultyCode
          ? [
            {
              where: { code: facultyCode },
              create: {
                code: facultyCode,
                name: facultyCode,
                display_name: facultyCode,
                is_active: false,
              },
            },
          ]
          : [],
        set: facultyCode ? [{ code: facultyCode }] : [],
      },
      topics: {
        deleteMany: {},
        create: topics,
      },
    },
  })
}

/**
 * Process course crawl jobs
 */
async function processCourseCrawlJob(job: Job<CourseCrawlJobData>) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    console.log(`Starting course crawl job ${job.id}`)

    // Fetch all courses in a single request
    const url = `https://app.coursedog.com/api/v1/cm/ucalgary_peoplesoft/courses?skip=0&limit=99999`

    console.log(`Fetching all courses from API...`)
    await job.updateProgress(5)

    const response = await axios.get<{ [key: string]: CourseData }>(url, {
      headers: {
        Accept: "application/json",
        Origin: "https://calendar.ucalgary.ca",
      },
    })

    const coursesData = Object.values(response.data)
    console.log(`Fetched ${coursesData.length} courses from API`)

    await job.updateProgress(10)

    // Process courses in parallel batches
    const BATCH_SIZE = 50 // Number of concurrent database operations
    const totalBatches = Math.ceil(coursesData.length / BATCH_SIZE)
    let totalSucceeded = 0
    let totalFailed = 0

    for (let i = 0; i < coursesData.length; i += BATCH_SIZE) {
      const batch = coursesData.slice(i, i + BATCH_SIZE)
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1

      console.log(`Processing batch ${currentBatch}/${totalBatches} (${batch.length} courses)`)

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map(courseData => processSingleCourse(courseData, prisma))
      )

      // Count successes and failures
      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      totalSucceeded += succeeded
      totalFailed += failed

      // Log any failures
      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          const courseCode = batch[idx]?.code || 'unknown'
          console.error(`Failed to process course ${courseCode}:`, result.reason)
        }
      })

      // Update progress (10% to 100%)
      const progress = 10 + ((currentBatch / totalBatches) * 90)
      await job.updateProgress(progress)

      console.log(`Batch ${currentBatch}/${totalBatches} completed: ${succeeded} succeeded, ${failed} failed (total: ${totalSucceeded} processed, ${totalFailed} failed)`)
    }

    await job.updateProgress(100)
    console.log(`Course crawl job ${job.id} completed. Total courses succeeded: ${totalSucceeded}, failed: ${totalFailed}`)

    return {
      total: totalSucceeded + totalFailed,
      totalSucceeded,
      totalFailed,
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Initialize course crawl worker
 */
export function initCourseCrawlWorker() {
  const courseCrawlWorker = createWorker<CourseCrawlJobData>(
    "course-crawl",
    processCourseCrawlJob,
    {
      concurrency: 1, // Process one crawl at a time to avoid rate limiting
    }
  )

  // Event listeners
  courseCrawlWorker.on("completed", (job) => {
    console.log(`✓ Course crawl job ${job.id} completed`)
  })

  courseCrawlWorker.on("failed", (job, err) => {
    console.error(`✗ Course crawl job ${job?.id} failed:`, err.message)
  })

  courseCrawlWorker.on("error", (err) => {
    console.error("Course crawl worker error:", err)
  })

  courseCrawlWorker.on("progress", (job, progress) => {
    const progressValue = typeof progress === 'number' ? progress : 0
    console.log(`Course crawl job ${job.id} progress: ${progressValue.toFixed(1)}%`)
  })

  activeWorkers.push(courseCrawlWorker)
  console.log("Course crawl worker initialized")
}
