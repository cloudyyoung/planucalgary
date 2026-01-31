import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Career } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import { DATABASE_URL } from "../../config"

interface ProgramData {
  id: string
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
  }
  transcriptLevel?: string
  transcriptDescription?: string
  requisites?: any
  status: string
  startTerm?: {
    year: number
    semester: number
  }
  createdAt?: number
  lastEditedAt?: number
  effectiveStartDate?: string
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
  const departments: string[] = []
  const faculties: string[] = []

  for (const item of input) {
    if (item.length === 2 || item === "UCALG") {
      faculties.push(item)
    } else {
      departments.push(item)
    }
  }

  return { departments, faculties }
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

function processStartTerm(startTerm: { year: number; semester: number } | undefined): any {
  if (!startTerm) {
    return null
  }

  const year = startTerm.year
  const term = TERMS[startTerm.semester]

  return {
    year,
    term,
  }
}

function processRequisites(requisites: any): any[] {
  if (!requisites || !requisites.requisitesSimple) {
    return []
  }

  const requisitesSimple = requisites.requisitesSimple
  return convertListCamelToSnake(requisitesSimple)
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

  const requisites = processRequisites(programData.requisites)
  const startTerm = processStartTerm(programData.startTerm)

  const createdAt = programData.createdAt ? new Date(programData.createdAt) : new Date()
  const lastEditedAt = programData.lastEditedAt ? new Date(programData.lastEditedAt) : new Date()
  const effectiveStartDate = programData.effectiveStartDate
    ? new Date(programData.effectiveStartDate)
    : new Date()

  const data = {
    pid: programData.programGroupId,
    coursedog_id: programData.id,
    program_group_id: programData.programGroupId,
    code: programData.code,
    name: programData.name,
    long_name: programData.longName,
    display_name: displayName,
    type: programData.type,
    degree_designation_code: degreeDesignationCode,
    degree_designation_name: degreeDesignationName,
    career,
    admission_info: customFields.programAdmissionsInfo || null,
    general_info: customFields.generalProgramInfo || null,
    transcript_level: transcriptLevel,
    transcript_description: finalTranscriptDescription,
    requisites,
    is_active: programData.status === "Active",
    start_term: startTerm,
    program_created_at: createdAt,
    program_last_updated_at: lastEditedAt,
    program_effective_start_date: effectiveStartDate,
    version: programData.version,
  }

  await prisma.program.upsert({
    where: { pid: data.pid },
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
        connectOrCreate: faculties.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
        set: faculties.map((code) => ({ code })),
      },
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

      // Process batch in parallel
      const results = await Promise.allSettled(batch.map((program) => processProgram(program, prisma)))

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
