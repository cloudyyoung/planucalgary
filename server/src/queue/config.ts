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
export const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
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
