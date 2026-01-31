import { RequestHandler } from "express"
import { JobProgress, JobState } from "bullmq"

export interface QueueCounts {
  active: number
  completed: number
  delayed: number
  failed: number
  paused: number
  prioritized: number
  waiting: number
  "waiting-children": number
}

export interface QueueJob {
  id?: string | undefined
  name: string
  data: any
  state: JobState | "unknown"
  progress: JobProgress
  attempts_started: number
  attempts_made: number
  return_value: any
  created_at: number
  processed_at?: number
  finished_at?: number
  failed_reason: string
  stacktrace: string[]
}

export interface QueueStatusResBody {
  counts: QueueCounts
  jobs: QueueJob[]
}

export type CatalogQueueStatusHandler = RequestHandler<never, QueueStatusResBody, never, never>

// Alias for backwards compatibility
export type QueueStatusHandler = CatalogQueueStatusHandler
