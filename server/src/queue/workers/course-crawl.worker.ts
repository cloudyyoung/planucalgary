import { Job } from "bullmq"
import { createWorker, activeWorkers } from "../config"
import { CourseCrawlJobData } from "../queues/course-crawl.queue"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import {
  processTopics,
  processFacultyCode,
  filterDepartments,
  processDescription,
  convertDictKeysCamelToSnake,
  componentSerializer,
  careerSerializer,
  CourseData,
} from "../../api/courses/crawl"
import { GradeMode } from "@planucalgary/shared/prisma/client"
import { DATABASE_URL } from "../../config"

const LIMIT = 100

/**
 * Process course crawl jobs
 */
async function processCourseCrawlJob(job: Job<CourseCrawlJobData>) {
  const { startBatch = 0, endBatch = 99999 } = job.data
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    console.log(`Starting course crawl job ${job.id} (batches ${startBatch} to ${endBatch})`)

    let totalProcessed = 0

    for (let t = startBatch; t <= endBatch; t++) {
      const limit = LIMIT
      const skip = t * LIMIT
      const url = `https://app.coursedog.com/api/v1/cm/ucalgary_peoplesoft/courses?skip=${skip}&limit=${limit}`

      await job.updateProgress(((t - startBatch) / (endBatch - startBatch + 1)) * 100)

      const response = await axios.get<{ [key: string]: CourseData }>(url, {
        headers: {
          Accept: "application/json",
          Origin: "https://calendar.ucalgary.ca",
        },
      })

      const coursesData = Object.values(response.data)
      console.log(`Batch ${t}: Fetched ${coursesData.length} courses`)

      if (coursesData.length === 0) {
        console.log("No more courses to process, exiting loop")
        break
      }

      const courses = coursesData.map((courseData) => {
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

        return prisma.course.upsert({
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
      })

      const transaction = await prisma.$transaction(
        async () => await Promise.allSettled(courses),
        {
          maxWait: 60000,
          timeout: 60000,
        }
      )

      totalProcessed += transaction.length
      console.log(`Batch ${t}: Processed ${transaction.length} courses (total: ${totalProcessed})`)
    }

    await job.updateProgress(100)
    console.log(`Course crawl job ${job.id} completed. Total courses processed: ${totalProcessed}`)

    return { success: true, totalProcessed, completedAt: new Date().toISOString() }
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
