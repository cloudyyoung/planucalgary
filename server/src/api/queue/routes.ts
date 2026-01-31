import express, { Router } from "express"
import asyncHandler from "express-async-handler"
import { courseCrawlQueue, CourseCrawlJobData } from "../../queue"
import { Job } from "bullmq"

export const router: Router = express.Router()

/**
 * GET /queue/course-crawl/status
 * Get course crawl queue statistics
 */
router.get(
    "/course-crawl/status",
    asyncHandler(async (_req, res) => {
        const counts = await courseCrawlQueue.getJobCounts()
        const jobs = await courseCrawlQueue.getJobs(["waiting", "active", "completed", "failed"], 0, 10)

        res.json({
            counts,
            recentJobs: await Promise.all(
                jobs.map(async (job: Job<CourseCrawlJobData>) => ({
                    id: job.id,
                    name: job.name,
                    data: job.data,
                    state: await job.getState(),
                    progress: job.progress,
                    attemptsMade: job.attemptsMade,
                    timestamp: job.timestamp,
                    returnvalue: job.returnvalue,
                }))
            ),
        })
    })
)

/**
 * GET /queue/course-crawl/:jobId
 * Get specific job status
 */
router.get(
    "/course-crawl/:jobId",
    asyncHandler(async (req, res) => {
        const { jobId } = req.params
        const job = await courseCrawlQueue.getJob(jobId)

        if (!job) {
            res.status(404).json({ error: "Job not found" })
            return
        }

        const state = await job.getState()

        res.json({
            id: job.id,
            name: job.name,
            data: job.data,
            state,
            progress: job.progress,
            attemptsMade: job.attemptsMade,
            timestamp: job.timestamp,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn,
            returnvalue: job.returnvalue,
            failedReason: job.failedReason,
        })
    })
)
