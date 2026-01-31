import { Worker } from "bullmq"
import { defaultWorkerOptions, redisConnection } from "./config";
import { crawlCourses } from "./catalog/courses";
import { crawlDepartments } from "./catalog/departments";
import { crawlCourseSets } from "./catalog/course-sets";
import { crawlPrograms } from "./catalog/programs";
import { crawlRequisiteSets } from "./catalog/requisite-sets";
import { crawlSubjects } from "./catalog/subjects";
import { syncCourseSets } from "./catalog/sync-course-sets";
import { syncCourses } from "./catalog/sync-courses";
import { syncFieldsOfStudy } from "./catalog/sync-fields-of-study";
import { syncRequisitesJsons } from "./catalog/sync-requisites-jsons";

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
        } else if (job.name === "sync-requisites-jsons") {
            await syncRequisitesJsons(job)
        } else if (job.name === "sync-courses") {
            await syncCourses(job)
        } else if (job.name === "sync-course-sets") {
            await syncCourseSets(job)
        } else if (job.name === "sync-fields-of-study") {
            await syncFieldsOfStudy(job)
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
