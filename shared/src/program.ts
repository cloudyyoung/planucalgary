import * as z from "zod"
import { CareerSchema } from "./enums"

export const ProgramStartTermSchema = z.object({
    start_term: z
        .object({
            year: z.number(),
            term: z.enum(["WINTER", "SPRING", "SUMMER", "FALL"]).nullable(),
        })
        .nullable(),
})

export type ProgramStartTerm = z.infer<typeof ProgramStartTermSchema>

export const ProgramCreateSchema = z.object({
    pid: z.string(),
    coursedog_id: z.string(),
    program_group_id: z.string(),
    code: z.string(),
    name: z.string(),
    long_name: z.string(),
    display_name: z.string(),
    type: z.string(),
    degree_designation_code: z.string().optional(),
    degree_designation_name: z.string().optional(),
    career: CareerSchema,
    admission_info: z.string().optional(),
    general_info: z.string().optional(),
    transcript_level: z.int().optional(),
    transcript_description: z.string().optional(),
    requisites: z.any().optional(),
    is_active: z.boolean(),
    start_term: ProgramStartTermSchema.optional(),
    program_created_at: z.date(),
    program_effective_start_date: z.date(),
    program_last_updated_at: z.date(),
    version: z.int(),
})

export type ProgramCreate = z.infer<typeof ProgramCreateSchema>

export const ProgramUpdateSchema = ProgramCreateSchema.partial()

export type ProgramUpdate = z.infer<typeof ProgramUpdateSchema>

export const ProgramCreateRelationsSchema = z.object({
    departments: z.array(z.string()),
    faculties: z.array(z.string()),
})

export type ProgramCreateRelations = z.infer<typeof ProgramCreateRelationsSchema>

export const ProgramUpdateRelationsSchema = ProgramCreateRelationsSchema.partial()

export type ProgramUpdateRelations = z.infer<typeof ProgramUpdateRelationsSchema>

export const ProgramListSchema = z.object({
    keywords: z.string().optional(),
})

export type ProgramList = z.infer<typeof ProgramListSchema>
