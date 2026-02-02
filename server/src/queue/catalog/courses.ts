import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Career, CourseComponent } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import { GradeMode } from "@planucalgary/shared/prisma/client"
import { DATABASE_URL } from "../../config"
import { DateTime } from 'luxon';
import { processRequisite, RequisiteData } from "./requisite-sets"

interface CourseData {
  _id: string
  archived: boolean
  blindGrading: boolean
  canSchedule: boolean
  id: string
  career: string
  catalogPrint: boolean
  code: string
  college: string
  components: { code: string }[]
  consent: string | null
  courseApproved: string
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
    allowMultipleEnroll: boolean
  }
  departments: string[]
  deprecatedCourseGroupId: string | null
  description: string
  dropConsent: string | null
  effectiveEndDate: string | null
  effectiveStartDate: string
  endTerm: {
    year: string
    id: string
    semester: number
  } | null
  examOnlyCourse: boolean
  gradeMode: string
  lastEditedAt: number
  lastSyncedAt: number
  longName: string
  name: string
  notes: string
  requisites: {
    requisites_simple: RequisiteData[]
  }
  schedulePrint: boolean
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

const processTopics = (courseId: string, topics: CourseData["topics"]) => {
  return topics.map((topic) => ({
    id: `${courseId}-${topic.code}`,
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

function processRequisites(requisites: CourseData["requisites"]) {
  let prereq: RequisiteData | null = null
  let coreq: RequisiteData | null = null
  let antireq: RequisiteData | null = null

  if (!requisites) {
    return { prereq, coreq, antireq }
  }

  const array = requisites.requisites_simple
  if (!array || !Array.isArray(array)) {
    return { prereq, coreq, antireq }
  }

  // Reference: https://coursedogcurriculum.docs.apiary.io/#reference/requisites/
  for (const req of array) {
    if (req.type === "Prerequisite") {
      prereq = req
    } else if (req.type === "Corequisite") {
      coreq = req
    } else if (req.type === "Antirequisite") {
      antireq = req
    }
  }

  return { prereq, coreq, antireq }
}

/**
 * Process a single course upsert
 */
async function processCourse(
  courseData: CourseData,
  prisma: PrismaClient
): Promise<void> {
  const topics = processTopics(courseData.id, courseData.topics)
  const [description, prereq, coreq, antireq, notes, aka, nogpa] = processDescription(
    courseData.description
  )
  const facultyCode = processFacultyCode(courseData.college)
  const faculties = facultyCode ? [facultyCode] : []
  const departments = filterDepartments(courseData.departments)
  const components = courseData.components.map((c) => componentSerializer(c.code))
  const career = careerSerializer(courseData.career)
  const rawRequisites = convertDictKeysCamelToSnake(courseData.requisites)
  const { prereq: prereqReq, coreq: coreqReq, antireq: antireqReq } = processRequisites(courseData.requisites)

  const data = {
    id: courseData.id,
    course_id: courseData.customFields.rawCourseId,
    course_group_id: courseData.courseGroupId,
    code: courseData.code,
    course_number: courseData.courseNumber,
    description: description,
    name: courseData.name,
    long_name: courseData.longName,
    notes: notes,
    version: courseData.version,
    units: courseData.credits.numberOfCredits,
    aka: aka,
    consent: courseData.consent,
    drop_consent: courseData.dropConsent,
    prereq: prereq,
    coreq: coreq,
    antireq: antireq,
    is_archived: courseData.archived,
    is_can_schedule: courseData.canSchedule,
    is_catalog_print: courseData.catalogPrint,
    is_blind_grading: courseData.blindGrading,
    is_course_approved: courseData.courseApproved === "Yes",
    is_exam_only_course: courseData.examOnlyCourse,
    is_active: courseData.status === "Active",
    is_multi_term: courseData.customFields.lastMultiTermCourse,
    is_no_gpa: nogpa,
    is_repeatable: courseData.credits.repeatable,
    components: components,
    course_created_at: new Date(courseData.createdAt),
    course_effective_start_date: DateTime.fromJSDate(new Date(courseData.effectiveStartDate)).toJSDate(),
    course_effective_end_date: courseData.effectiveEndDate
      ? DateTime.fromJSDate(new Date(courseData.effectiveEndDate)).toJSDate()
      : null,
    course_last_updated_at: new Date(courseData.lastEditedAt),
    course_last_synced_at: new Date(courseData.lastSyncedAt),
    start_term: courseData.startTerm as any,
    end_term: courseData.endTerm as any,
    grade_mode: GradeMode.CRF,
    career: career,
    raw_requisites: rawRequisites,
  }

  await Promise.all([
    prisma.subject.upsert({
      where: { code: courseData.subjectCode },
      create: { code: courseData.subjectCode, title: courseData.subjectCode },
      update: {},
    }),
    ...departments.map((code) =>
      prisma.department.upsert({
        where: { code },
        create: { code, name: code, display_name: code, is_active: false },
        update: {},
      })
    ),
    ...faculties.map((code) =>
      prisma.faculty.upsert({
        where: { code },
        create: { code, name: code, display_name: code, is_active: false },
        update: {},
      })
    ),
    prereqReq && processRequisite(prereqReq, prisma),
    coreqReq && processRequisite(coreqReq, prisma),
    antireqReq && processRequisite(antireqReq, prisma),
  ].filter(Boolean))

  // Now create/update the course with all connections
  await prisma.course.upsert({
    where: { id: data.id },
    create: {
      ...data,
      subject: { connect: { code: courseData.subjectCode } },
      departments: { connect: departments.map((code) => ({ code })), },
      faculties: { connect: faculties.map((code) => ({ code })), },
      topics: { create: topics },
      prereq_requisite: prereqReq
        ? { connect: { id: prereqReq.id } }
        : undefined,
      coreq_requisite: coreqReq
        ? { connect: { id: coreqReq.id } }
        : undefined,
      antireq_requisite: antireqReq
        ? { connect: { id: antireqReq.id } }
        : undefined,
    },
    update: {
      ...data,
      subject: { connect: { code: courseData.subjectCode } },
      departments: { set: departments.map((code) => ({ code })), },
      faculties: { set: faculties.map((code) => ({ code })), },
      topics: {
        deleteMany: {},
        create: topics,
      },
      prereq_requisite: prereqReq
        ? { connect: { id: prereqReq.id } }
        : { disconnect: true },
      coreq_requisite: coreqReq
        ? { connect: { id: coreqReq.id } }
        : { disconnect: true },
      antireq_requisite: antireqReq
        ? { connect: { id: antireqReq.id } }
        : { disconnect: true },
    },
  })
}

/**
 * Process course crawl jobs
 */
export async function crawlCourses(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const url = `https://app.coursedog.com/api/v1/cm/ucalgary_peoplesoft/courses`
    const response = await axios.get<{ [key: string]: CourseData }>(url, {
      headers: {
        Accept: "application/json",
        Origin: "https://calendar.ucalgary.ca",
      },
      params: {
        // effectiveDatesRange: "1901-01-01,2099-01-01",
      },
      timeout: 60000,
    })

    const coursesData = Object.values(response.data)

    await job.updateProgress(10)

    // Process courses in parallel batches
    const BATCH_SIZE = 50
    const totalBatches = Math.ceil(coursesData.length / BATCH_SIZE)
    let totalSucceeded = 0
    let totalFailed = 0

    for (let i = 0; i < coursesData.length; i += BATCH_SIZE) {
      const batch = coursesData.slice(i, i + BATCH_SIZE)
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1

      // Process batch in parallel within a transaction
      const results = await prisma.$transaction((tx) => {
        return Promise.allSettled(
          batch.map(courseData => processCourse(courseData, tx as PrismaClient))
        )
      })

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

