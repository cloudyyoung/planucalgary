import { Job } from "bullmq"

/**
 * This job used to sync parsed requisite JSON into columns removed by migration
 * `20260314073959_remove_requisite_json_fields`. It is kept as a no-op so
 * existing queue destinations do not fail unexpectedly.
 */
export async function syncCourses(job: Job) {
  await job.updateProgress(100)

  return {
    message: "No-op: courses prerequisite JSON columns were removed.",
    affected_rows: 0,
  }
}
