import { createQueue } from "../config"

// Create course crawl queue
export const courseCrawlQueue = createQueue("course-crawl")

/**
 * Add a course crawl job to the queue
 */
export async function startCourseCrawl() {
  const job = await courseCrawlQueue.add("crawl-courses", {}, {
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
