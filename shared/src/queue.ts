import { RequestHandler } from "express"
import { JobProgress, JobState } from "bullmq"

export interface QueueStatusResBody {
  counts: {
    active: number
    completed: number
    delayed: number
    failed: number
    paused: number
    prioritized: number
    waiting: number
    "waiting-children": number
  }
  jobs: {
    id?: string | undefined
    name: string
    data: any
    state: JobState | "unknown"
    progress: JobProgress
    attemptsMade: number
    timestamp: number
    returnvalue?: any
  }[]
}

export type QueueStatusHandler = RequestHandler<never, QueueStatusResBody, never, never>
