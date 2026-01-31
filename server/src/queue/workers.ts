import { Worker } from "bullmq"
import { defaultWorkerOptions, redisConnection } from "./config";
import { crawlCourses } from "./catalog/courses";

export const cataloglWorker = new Worker(
    "catalog",
    async (job) => {
        if (job.name === "courses") {
            await crawlCourses(job)
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
