import { initCourseCrawlWorker } from "./workers/course-crawl.worker"

/**
 * Initialize all queue workers
 */
export function initWorkers() {
    console.log("Initializing queue workers...")

    // Initialize all workers
    initCourseCrawlWorker()

    console.log("All queue workers initialized")
}

// Export queues
export { courseCrawlQueue, startCourseCrawl } from "./queues/course-crawl.queue"
export type { CourseCrawlJobData } from "./queues/course-crawl.queue"

// Export config utilities
export { closeQueues } from "./config"
