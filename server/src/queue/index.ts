import { initCourseCrawlWorker } from "./workers/course-crawl.worker"

/**
 * Initialize all queue workers
 */
export function initWorkers() {
  initCourseCrawlWorker()
}

export * from "./queues"

export { closeQueues } from "./config"
