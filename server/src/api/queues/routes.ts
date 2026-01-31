import { Router } from "express"
import asyncHandler from "express-async-handler"
import { catalogQueue } from "@/queue"
import { Job } from "bullmq"

export const router: Router = Router()


router.get(
    `/${catalogQueue.name}`,
    asyncHandler(async (_req, res) => {

        const counts = await catalogQueue.getJobCounts()
        const jobs = await catalogQueue.getJobs()

        res.json({
            counts,
            jobs: await Promise.all(
                jobs.map(async (job: Job) => ({
                    state: await job.getState(),
                    ...job,
                }))
            ),
        })
    })
)
