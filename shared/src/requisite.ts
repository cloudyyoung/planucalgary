import * as z from "zod"
import { RequisiteTypeSchema } from "./enum"

export const RequisiteListSchema = z.object({
    requisite_type: RequisiteTypeSchema.optional(),
})

export type RequisiteList = z.infer<typeof RequisiteListSchema>

export const RequisiteJsonCreateSchema = z.object({
    requisite_type: RequisiteTypeSchema,
    text: z.string(),
    departments: z.array(z.string()),
    faculties: z.array(z.string()),
    json: z.any().nullable(),
    json_choices: z.array(z.string()),
})

export type RequisiteJsonCreate = z.infer<typeof RequisiteJsonCreateSchema>

export const RequisitesSyncSchema = z.object({
    destination: z.enum(["requisites_jsons", "courses", "course_sets"]),
})

export type RequisitesSync = z.infer<typeof RequisitesSyncSchema>

export const RequisiteUpdateSchema = z.object({
    json: z.json(),
})

export type RequisiteUpdate = z.infer<typeof RequisiteUpdateSchema>
