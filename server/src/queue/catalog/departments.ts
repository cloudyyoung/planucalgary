import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@planucalgary/shared/prisma/client"
import axios from "axios"
import { DATABASE_URL } from "../../config"

interface DepartmentData {
  id: string
  name: string
  displayName: string
  status: string
}

/**
 * Process a single department or faculty upsert
 */
async function processDepartment(
  code: string,
  name: string,
  displayName: string,
  isActive: boolean,
  prisma: PrismaClient
): Promise<void> {
  const data = {
    code,
    name,
    display_name: displayName,
    is_active: isActive,
  }

  if (code.length === 2 || code === "UCALG") {
    // Two letters code is a faculty
    await prisma.faculty.upsert({
      where: { code: data.code },
      create: data,
      update: data,
    })
  } else {
    // Four letters code is a department
    await prisma.department.upsert({
      where: { code: data.code },
      create: data,
      update: data,
    })
  }
}


/**
 * Process department crawl jobs
 */
export async function crawlDepartments(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const url = "https://app.coursedog.com/api/v1/ucalgary_peoplesoft/departments"
    const response = await axios.get<{ [key: string]: DepartmentData }>(url, {
      headers: {
        "Content-Type": "application/json",
        Origin: "https://calendar.ucalgary.ca",
      },
      timeout: 60000,
    })

    const departmentsData = Object.values(response.data)

    await job.updateProgress(10)

    // Process departments in parallel batches
    const BATCH_SIZE = 50
    const totalBatches = Math.ceil(departmentsData.length / BATCH_SIZE)
    let totalSucceeded = 0
    let totalFailed = 0

    for (let i = 0; i < departmentsData.length; i += BATCH_SIZE) {
      const batch = departmentsData.slice(i, i + BATCH_SIZE)
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map((department) =>
          processDepartment(
            department.id,
            department.name,
            department.displayName,
            department.status === "Active",
            prisma
          )
        )
      )

      // Count successes and failures
      const succeeded = results.filter((r) => r.status === "fulfilled").length
      const failed = results.filter((r) => r.status === "rejected").length

      totalSucceeded += succeeded
      totalFailed += failed

      // Log any failures
      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          const code = batch[idx]?.id || "unknown"
          console.error(`Failed to process department ${code}:`, result.reason)
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
