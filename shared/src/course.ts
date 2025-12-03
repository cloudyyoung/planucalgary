import * as z from 'zod'
import { GradeNodeSchema, CareerSchema } from "./enum"

export const CourseListSchema = z.object({
    keywords: z.string().optional(),
})

export type CourseList = z.infer<typeof CourseListSchema>

export const CourseCreateSchema = z.object({
    cid: z.string(),
    code: z.string(),
    course_number: z.string(),
    subject_code: z.string(),
    description: z.string().nullable(),
    name: z.string(),
    long_name: z.string(),
    notes: z.string().nullable(),
    version: z.int(),
    units: z.int().nullable(),
    aka: z.string().nullable(),
    prereq: z.string().nullable(),
    prereq_json: z.any().nullable(),
    coreq: z.string().nullable(),
    coreq_json: z.any().nullable(),
    antireq: z.string().nullable(),
    antireq_json: z.any().nullable(),
    is_active: z.boolean(),
    is_multi_term: z.boolean(),
    is_nogpa: z.boolean(),
    is_repeatable: z.boolean(),
    course_group_id: z.string(),
    coursedog_id: z.string(),
    course_created_at: z.date(),
    course_effective_start_date: z.date(),
    course_last_updated_at: z.date(),
    grade_mode: GradeNodeSchema,
    career: CareerSchema,
})

export type CourseCreate = z.infer<typeof CourseCreateSchema>

export const CourseCreateRelationsSchema = z.object({
    departments: z.array(z.string()),
    faculties: z.array(z.string()),
    topics: z.array(
        z.object({
            id: z.string().optional(),
            name: z.string(),
            description: z.string().optional(),
        })
    ),
})

export type CourseCreateRelations = z.infer<typeof CourseCreateRelationsSchema>

export const CourseUpdateSchema = CourseCreateSchema.partial()

export type CourseUpdate = z.infer<typeof CourseUpdateSchema>

export const CourseUpdateRelationsSchema = CourseCreateRelationsSchema.partial()

export type CourseUpdateRelations = z.infer<typeof CourseUpdateRelationsSchema>