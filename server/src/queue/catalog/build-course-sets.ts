import { Job } from "bullmq"
import { PrismaPg } from "@prisma/adapter-pg"
import { RequisiteRuleValue } from "./types"
import { CourseSet, PrismaClient } from "@/generated/prisma/client"
import { DATABASE_URL } from "../../config"


export async function buildCourseSets(job: Job) {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const prisma = new PrismaClient({ adapter })
  const rules = await prisma.courseSet.findMany()

  const chunkSize = 50
  const totalRules = rules.length

  for (let i = 0; i < rules.length; i += chunkSize) {
    const chunk = rules.slice(i, i + chunkSize)
    await Promise.all(chunk.map(rule => buildCourseSet(rule, prisma)))
    const progress = Math.min(((i + chunkSize) / totalRules) * 100, 100)
    await job.updateProgress(progress)
  }

  await job.updateProgress(100)
  await prisma.$disconnect()
}

async function buildCourseSet(courseSet: CourseSet, prisma: PrismaClient) {
  const courseList = courseSet.course_list
  const courses = await prisma.course.findMany({
    where: { course_group_id: { in: courseList } },
    select: { id: true },
  })
  await prisma.courseSet.update({
    where: { id: courseSet.id },
    data: {
      courses: {
        set: courses.map(c => ({ id: c.id })),
      },
    },
  })
}