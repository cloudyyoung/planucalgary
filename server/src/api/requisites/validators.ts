import { RequisiteType } from "@prisma/client"
import { z } from "zod"

export const RequisiteListSchema = z.object({
  type: z.nativeEnum(RequisiteType).optional(),
})

export type RequisiteList = z.infer<typeof RequisiteListSchema>

export const RequisitesSyncSchema = z.object({
  destination: z.enum(["requisites_jsons", "courses", "course_sets"]),
})

export type RequisitesSync = z.infer<typeof RequisitesSyncSchema>

export const RequisiteUpdateSchema = z.object({
  json: z.record(z.any()),
})

export type RequisiteUpdate = z.infer<typeof RequisiteUpdateSchema>
