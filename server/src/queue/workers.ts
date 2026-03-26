import { Worker } from "bullmq"
import { defaultWorkerOptions, redisConnection } from "./config";
import { crawlCourses } from "./catalog/courses";
import { crawlDepartments } from "./catalog/departments";
import { crawlCourseSets } from "./catalog/course-sets";
import { crawlPrograms } from "./catalog/programs";
import { crawlRequisiteSets } from "./catalog/requisite-sets";
import { crawlSubjects } from "./catalog/subjects";
import { extractFieldsOfStudy } from "./catalog/extract-fields-of-study";
import { buildRequisiteRules } from "./catalog/build-requisite-rules";
import { buildCourseSets } from "./catalog/build-course-sets";

export const cataloglWorker = new Worker(
    "catalog",
    async (job) => {
        if (job.name === "courses") {
            await crawlCourses(job)
        } else if (job.name === "departments") {
            await crawlDepartments(job)
        } else if (job.name === "course-sets") {
            await crawlCourseSets(job)
        } else if (job.name === "programs") {
            await crawlPrograms(job)
        } else if (job.name === "requisite-sets") {
            await crawlRequisiteSets(job)
        } else if (job.name === "subjects") {
            await crawlSubjects(job)
        } else if (job.name === "extract-fields-of-study") {
            await extractFieldsOfStudy(job)
        } else if (job.name === "build-requisite-rules") {
            await buildRequisiteRules(job)
        } else if (job.name === "build-course-sets") {
            await buildCourseSets(job)
        }
    },
    defaultWorkerOptions,
)

export const workers: Worker[] = [
    cataloglWorker,
]


/**
 * Gracefully close all workers and Redis connection
 */
export async function closeWorkers(): Promise<void> {
    await Promise.all(workers.map((worker) => worker.close()))
    await redisConnection.quit()
}
