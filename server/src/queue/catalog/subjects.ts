import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import { DATABASE_URL } from "../../config"

interface CourseSearchData {
  subjectCode: string
  departments: string[]
}

interface SubjectOption {
  value: string
  label: string
}

interface SearchConfigResponse {
  filters: Array<{
    config: {
      options: SubjectOption[]
    }
  }>
}

interface CatalogQuestionEffect {
  value: string
}

interface CatalogQuestionAction {
  effects: CatalogQuestionEffect[]
}

interface CatalogQuestionsResponse {
  w3rO8: {
    actions: CatalogQuestionAction[]
  }
}

interface SubjectMapping {
  code: string
  title: string
  faculties: string[]
  departments: string[]
}

/**
 * Fetch subject code to department/faculty mappings
 */
async function fetchSubjectMappings(): Promise<Map<string, { faculties: Set<string>; departments: Set<string> }>> {
  const url =
    "https://app.coursedog.com/api/v1/cm/ucalgary_peoplesoft/courses/search/%24filters?catalogId=R7TegZ8xGZCLE3avlAjI&skip=0&limit=99999&orderBy=code&formatDependents=false&columns=department%2CsubjectCode"

  const response = await axios.get<{ data: CourseSearchData[] }>(url, {
    headers: {
      "Content-Type": "application/json",
      Origin: "https://calendar.ucalgary.ca",
    },
    timeout: 60000,
  })

  const mappings = new Map<string, { faculties: Set<string>; departments: Set<string> }>()

  for (const course of response.data.data) {
    const subjectCode = course.subjectCode

    if (!mappings.has(subjectCode)) {
      mappings.set(subjectCode, { faculties: new Set(), departments: new Set() })
    }

    const mapping = mappings.get(subjectCode)!

    for (const department of course.departments) {
      if (department.length === 2 || department === "UCALG") {
        mapping.faculties.add(department)
      } else {
        mapping.departments.add(department)
      }
    }
  }

  return mappings
}

/**
 * Fetch subjects from search configuration
 */
async function fetchMainSubjects(): Promise<Array<{ code: string; title: string }>> {
  const url = "https://app.coursedog.com/api/v1/ca/ucalgary_peoplesoft/search-configurations/3HheDcKChSNwS1Wr1Khr"

  const response = await axios.get<SearchConfigResponse>(url, {
    headers: {
      "Content-Type": "application/json",
      Origin: "https://calendar.ucalgary.ca",
    },
    timeout: 60000,
  })

  const subjects: Array<{ code: string; title: string }> = []
  const filters = response.data.filters
  const subjectCodeFilter = filters[0]
  const options = subjectCodeFilter.config.options

  for (const option of options) {
    const label = String(option.label)
    const [code, title] = label.split(" - ", 2)
    if (code && title) {
      subjects.push({ code, title })
    }
  }

  return subjects
}

/**
 * Fetch subjects from catalog questions
 */
async function fetchCatalogQuestionSubjects(): Promise<Array<{ code: string; title: string }>> {
  const url = "https://app.coursedog.com/api/v1/ucalgary_peoplesoft/general/courseTemplate/questions"

  const response = await axios.get<CatalogQuestionsResponse>(url, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 60000,
  })

  const subjects: Array<{ code: string; title: string }> = []
  const w3rO8 = response.data.w3rO8
  const actions = w3rO8.actions

  for (const action of actions) {
    const effects = action.effects

    for (const effect of effects) {
      let value = String(effect.value)
      value = value.replace(/<p>/g, "").replace(/<\/p>/g, "")

      if (!value.includes(" - ")) {
        console.log("Skipping value:", value)
        continue
      }

      const [subjectCode, title] = value.split(" - ", 2)
      if (subjectCode && title) {
        subjects.push({ code: subjectCode, title })
      }
    }
  }

  return subjects
}

/**
 * Process a single subject upsert
 */
async function processSubject(subject: SubjectMapping, prisma: PrismaClient): Promise<void> {
  const data = {
    code: subject.code,
    title: subject.title,
  }

  await prisma.subject.upsert({
    where: { code: data.code },
    create: {
      ...data,
      departments: {
        connectOrCreate: subject.departments.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
      faculties: {
        connectOrCreate: subject.faculties.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
      },
    },
    update: {
      ...data,
      departments: {
        connectOrCreate: subject.departments.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
        set: subject.departments.map((code) => ({ code })),
      },
      faculties: {
        connectOrCreate: subject.faculties.map((code) => ({
          where: { code },
          create: { code, name: code, display_name: code, is_active: false },
        })),
        set: subject.faculties.map((code) => ({ code })),
      },
    },
  })
}

/**
 * Process subject crawl jobs
 */
export async function crawlSubjects(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    // Step 1: Fetch subject mappings (10%)
    await job.updateProgress(5)
    const mappings = await fetchSubjectMappings()
    await job.updateProgress(10)

    // Step 2: Fetch main subjects (20%)
    const mainSubjects = await fetchMainSubjects()
    await job.updateProgress(20)

    // Step 3: Fetch catalog question subjects (30%)
    const catalogSubjects = await fetchCatalogQuestionSubjects()
    await job.updateProgress(30)

    // Step 4: Merge and deduplicate subjects
    const subjectsMap = new Map<string, SubjectMapping>()

    // Process main subjects
    for (const subject of mainSubjects) {
      const title = subject.title

      const mapping = mappings.get(subject.code)
      subjectsMap.set(subject.code, {
        code: subject.code,
        title,
        faculties: mapping ? Array.from(mapping.faculties) : [],
        departments: mapping ? Array.from(mapping.departments) : [],
      })
    }

    // Process catalog subjects
    for (const subject of catalogSubjects) {
      // Skip if already exists
      if (subjectsMap.has(subject.code)) {
        continue
      }

      const title = subject.title

      const mapping = mappings.get(subject.code)
      subjectsMap.set(subject.code, {
        code: subject.code,
        title,
        faculties: mapping ? Array.from(mapping.faculties) : [],
        departments: mapping ? Array.from(mapping.departments) : [],
      })
    }

    const allSubjects = Array.from(subjectsMap.values())

    await job.updateProgress(35)

    // Step 5: Process subjects in parallel batches
    const BATCH_SIZE = 50
    const totalBatches = Math.ceil(allSubjects.length / BATCH_SIZE)
    let totalSucceeded = 0
    let totalFailed = 0

    for (let i = 0; i < allSubjects.length; i += BATCH_SIZE) {
      const batch = allSubjects.slice(i, i + BATCH_SIZE)
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1

      // Process batch in parallel
      const results = await Promise.allSettled(batch.map((subject) => processSubject(subject, prisma)))

      // Count successes and failures
      const succeeded = results.filter((r) => r.status === "fulfilled").length
      const failed = results.filter((r) => r.status === "rejected").length

      totalSucceeded += succeeded
      totalFailed += failed

      // Log any failures
      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          const code = batch[idx]?.code || "unknown"
          console.error(`Failed to process subject ${code}:`, result.reason)
        }
      })

      // Update progress (35% to 100%)
      const progress = 35 + (currentBatch / totalBatches) * 65
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
