import { initCourseCrawlWorker } from "./workers/course-crawl.worker"

/**
 * Initialize all queue workers
 */
export function initWorkers() {
  initCourseCrawlWorker()
}

// Export queues
export { courseCrawlQueue, startCourseCrawl } from "./queues/course-crawl.queue"

// Export config utilities
export { closeQueues } from "./config"
