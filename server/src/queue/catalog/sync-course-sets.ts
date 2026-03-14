import { Job } from "bullmq"

/**
 * This job used to sync parsed requisite JSON into a column removed by
 * migration `20260314073959_remove_requisite_json_fields`.
 */
export async function syncCourseSets(job: Job) {
  await job.updateProgress(100)

  return {
    message: "No-op: course set JSON column was removed.",
    affected_rows: 0,
  }
}
