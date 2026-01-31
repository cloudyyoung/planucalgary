import { Queue, QueueOptions, Worker, WorkerOptions } from "bullmq"
import IORedis from "ioredis"
import { REDIS_URL } from "../config"

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables")
}

// Create Redis connection for BullMQ
export const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
})

// Default queue options
const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
}

// Default worker options
export const defaultWorkerOptions: WorkerOptions = {
  connection: redisConnection,
  concurrency: 5,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
}

/**
 * Create a new queue with default options
 */
export function createQueue<T = any>(name: string, options?: Partial<QueueOptions>): Queue<T> {
  return new Queue<T>(name, {
    ...defaultQueueOptions,
    ...options,
  })
}

/**
 * Create a new worker with default options
 */
export function createWorker<T = any>(
  name: string,
  processor: (job: any) => Promise<any>,
  options?: Partial<WorkerOptions>
): Worker<T> {
  const worker = new Worker<T>(name, processor, {
    ...defaultWorkerOptions,
    ...options,
  })
  activeWorkers.push(worker)
  return worker
}

// Export active workers for graceful shutdown
export const activeWorkers: Worker[] = []

/**
 * Gracefully close all workers and Redis connection
 */
export async function closeQueues(): Promise<void> {
  console.log("Closing queue workers...")
  await Promise.all(activeWorkers.map((worker) => worker.close()))
  await redisConnection.quit()
  console.log("All queue workers closed")
}
