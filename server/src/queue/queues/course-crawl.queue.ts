import { createQueue } from "../config"

export interface CourseCrawlJobData {
  startBatch?: number
  endBatch?: number
}

// Create course crawl queue
export const courseCrawlQueue = createQueue<CourseCrawlJobData>("course-crawl")

/**
 * Add a course crawl job to the queue
 */
export async function startCourseCrawl(data: CourseCrawlJobData = {}) {
  const job = await courseCrawlQueue.add("crawl-courses", data, {
    priority: 1,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  })
  console.log(`Course crawl job ${job.id} added to queue`)
  return job.id
}
