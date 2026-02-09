import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Career } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import { DateTime } from "luxon"
import { RequisiteData } from "@planucalgary/shared"
import { DATABASE_URL } from "../../config"
import { processRequisite } from "./requisite-sets"
import { ProgramCreateArgs } from "../../../../shared/dist/generated/prisma/models"

interface ProgramData {
  _id: string
  programGroupId: string
  code: string
  name: string
  longName: string
  catalogDisplayName?: string
  type: string
  degreeDesignation?: string
  career?: string
  departments?: string[]
  customFields?: {
    programAdmissionsInfo?: string
    generalProgramInfo?: string
    aSfCl?: string
  }
  transcriptLevel?: string
  transcriptDescription?: string
  requisites?: {
    requisitesSimple?: RequisiteData[]
  }
  status: string
  startTerm?: {
    year: number | string
    semester: number
  } | Record<string, never>
  endTerm?: {
    year: number | string
    semester: number
  } | Record<string, never>
  createdAt: number
  lastEditedAt: number
  lastSyncedAt: number
  effectiveStartDate: string
  effectiveEndDate?: string
  version: number
}

interface ProgramResponse {
  [key: string]: ProgramData
}

const TERMS: { [key: number]: string | null } = {
  0: null,
  1: "WINTER",
  3: "SPRING",
  5: "SUMMER",
  7: "FALL",
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

function processDepartments(input: string[]): { departments: string[]; faculties: string[] } {
  return { departments: input, faculties: [] }
}

function processDegreeDesignation(designation: string | undefined): {
  code: string | null
  name: string | null
} {
  if (!designation) {
    return { code: null, name: null }
  }

  if (!designation.includes(" - ")) {
    return { code: null, name: designation }
  }

  const [code, name] = designation.split(" - ")
  return { code, name }
}


function processRequisites(requisites: ProgramData["requisites"]): RequisiteData[] {
  if (!requisites || !requisites.requisitesSimple) {
    return []
  }

  return requisites.requisitesSimple
}

/**
 * Process a single program upsert
 */
async function processProgram(programData: ProgramData, prisma: PrismaClient): Promise<void> {
  const customFields = programData.customFields || {}

  const displayName = programData.catalogDisplayName || programData.longName
  const { code: degreeDesignationCode, name: degreeDesignationName } = processDegreeDesignation(
    programData.degreeDesignation
  )
  const career = careerSerializer(programData.career || "")
  const { departments, faculties } = processDepartments(programData.departments || [])

  const transcriptLevelStr = programData.transcriptLevel || ""
  const transcriptDescription = (programData.transcriptDescription || "").trim()

  let transcriptLevel: number | null = null
  let finalTranscriptDescription: string | null = null

  if (/^\d+$/.test(transcriptLevelStr)) {
    transcriptLevel = parseInt(transcriptLevelStr)
  }

  if (transcriptDescription !== "") {
    finalTranscriptDescription = transcriptDescription
  } else {
    transcriptLevel = null
    finalTranscriptDescription = null
  }

  const rawRequisites = programData.requisites && convertDictKeysCamelToSnake(programData.requisites)
  const requisites = processRequisites(programData.requisites)

  const startTerm = programData.startTerm && Object.keys(programData.startTerm).length > 0
    ? programData.startTerm
    : undefined
  const endTerm = programData.endTerm && Object.keys(programData.endTerm).length > 0
    ? programData.endTerm
    : undefined

  const data: ProgramCreateArgs["data"] = {
    id: programData._id,
    program_group_id: programData.programGroupId,
    code: programData.code,
    name: programData.name,
    long_name: programData.longName,
    display_name: displayName,
    notes: programData.customFields?.aSfCl,
    type: programData.type,
    degree_designation_code: degreeDesignationCode,
    degree_designation_name: degreeDesignationName,
    career,
    admission_info: customFields.programAdmissionsInfo || null,
    general_info: customFields.generalProgramInfo || null,
    transcript_level: transcriptLevel,
    transcript_description: finalTranscriptDescription,
    raw_requisites: rawRequisites as any,
    is_active: programData.status === "Active",
    start_term: startTerm,
    end_term: endTerm,
    program_created_at: new Date(programData.createdAt),
    program_last_updated_at: new Date(programData.lastEditedAt),
    program_last_synced_at: new Date(programData.lastSyncedAt),
    program_effective_start_date: DateTime.fromJSDate(new Date(programData.effectiveStartDate)).toJSDate(),
    program_effective_end_date: programData.effectiveEndDate
      ? DateTime.fromJSDate(new Date(programData.effectiveEndDate)).toJSDate()
      : null,
    version: programData.version,
  }

  await Promise.all([
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
    ...requisites.map((req) => processRequisite(req, prisma)),
  ])

  await prisma.program.upsert({
    where: { id: data.id },
    create: {
      ...data,
      departments: { connect: departments.map((code) => ({ code })) },
      faculties: { connect: faculties.map((code) => ({ code })) },
      requisites: { connect: requisites.map((req) => ({ id: req.id })) },
    },
    update: {
      ...data,
      departments: { set: departments.map((code) => ({ code })) },
      faculties: { set: faculties.map((code) => ({ code })) },
      requisites: { set: requisites.map((req) => ({ id: req.id })) },
    },
  })
}

/**
 * Process program crawl jobs
 */
export async function crawlPrograms(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const url = "https://app.coursedog.com/api/v1/cm/ucalgary_peoplesoft/programs?sortBy=catalogDisplayName"
    const response = await axios.get<ProgramResponse>(url, {
      headers: {
        Origin: "https://calendar.ucalgary.ca",
      },
      timeout: 60000,
    })

    const programsData = Object.values(response.data)

    await job.updateProgress(10)

    // Process programs in parallel batches
    const BATCH_SIZE = 50
    const totalBatches = Math.ceil(programsData.length / BATCH_SIZE)
    let totalSucceeded = 0
    let totalFailed = 0

    for (let i = 0; i < programsData.length; i += BATCH_SIZE) {
      const batch = programsData.slice(i, i + BATCH_SIZE)
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1

      // Process batch in parallel within a transaction
      const results = await prisma.$transaction((tx) => {
        return Promise.allSettled(
          batch.map((program) => processProgram(program, tx as PrismaClient))
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
          const code = batch[idx]?.code || "unknown"
          console.error(`Failed to process program ${code}:`, result.reason)
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
