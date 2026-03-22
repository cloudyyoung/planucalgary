import { Job } from "bullmq"

import { createTRPCRouter, adminProcedure } from "../init"
import { catalogQueue } from "../../queue"

export const queuesRouter = createTRPCRouter({
  catalog: adminProcedure.query(async () => {
    const counts = await catalogQueue.getJobCounts()
    const jobs = await catalogQueue.getJobs()
    jobs.sort((a, b) => b.timestamp - a.timestamp)

    return {
      counts: {
        active: counts.active,
        completed: counts.completed,
        delayed: counts.delayed,
        failed: counts.failed,
        paused: counts.paused,
        prioritized: counts.prioritized,
        waiting: counts.waiting,
        "waiting-children": counts["waiting-children"],
      },
      jobs: await Promise.all(
        jobs.map(async (job: Job) => ({
          id: job.id,
          name: job.name,
          data: job.data,
          state: await job.getState(),
          progress: job.progress,
          attempts_started: job.attemptsStarted,
          attempts_made: job.attemptsMade,
          return_value: job.returnvalue,
          created_at: job.timestamp,
          processed_at: job.processedOn,
          finished_at: job.finishedOn,
          failed_reason: job.failedReason,
          stacktrace: job.stacktrace,
        })),
      ),
    }
  }),
})