import express, { Router } from "express"
import asyncHandler from "express-async-handler"
import { courseCrawlQueue } from "@/queue"
import { Job } from "bullmq"

export const router: Router = express.Router()

/**
 * GET /queue/course-crawl
 * Get course crawl queue statistics
 */
router.get(
    "/course-crawl",
    asyncHandler(async (_req, res) => {
        const counts = await courseCrawlQueue.getJobCounts()
        const jobs = await courseCrawlQueue.getJobs(["waiting", "active", "completed", "failed"], 0, 10)

        res.json({
            counts,
            recentJobs: await Promise.all(
                jobs.map(async (job: Job) => ({
                    state: await job.getState(),
                    ...job,
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

        res.json(job)
    })
)
