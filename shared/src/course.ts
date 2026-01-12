import * as z from 'zod'
import { type RequestHandler } from 'express';
import { GradeNodeSchema, CareerSchema } from "./enum"
import { CourseTopicCreateSchema } from './course-topic'
import { PaginatedRequestSchema, PaginatedResponse } from './pagination'
import { IdInputSchema } from './id';

const CourseSchema = z.object({
    id: z.string().readonly(),
    created_at: z.date().readonly(),
    updated_at: z.date().readonly(),

    cid: z.string(),
    code: z.string(),
    course_number: z.string(),

    subject_code: z.string(),

    description: z.string().nullable(),
    name: z.string(),
    long_name: z.string(),
    notes: z.string().nullable(),
    version: z.number(),
    units: z.number().nullable(),
    aka: z.string().nullable(),

    prereq: z.string().nullable(),
    prereq_json: z.json().nullable(),
    coreq: z.string().nullable(),
    coreq_json: z.json().nullable(),
    antireq: z.string().nullable(),
    antireq_json: z.json().nullable(),

    is_active: z.boolean(),
    is_multi_term: z.boolean(),
    is_no_gpa: z.boolean(),
    is_repeatable: z.boolean(),

    course_group_id: z.string(),
    coursedog_id: z.string(),

    course_created_at: z.date(),
    course_effective_start_date: z.date(),
    course_last_updated_at: z.date(),

    career: CareerSchema,
    grade_mode: GradeNodeSchema,
})
export type Course = z.infer<typeof CourseSchema>


// List Courses
export const CourseListReqQuerySchema = z.object({
    keywords: z.string().optional(),
    sorting: z.string().optional(),
}).extend(PaginatedRequestSchema.shape)
export type CourseListReqQuery = z.infer<typeof CourseListReqQuerySchema>
export const CourseListResBodySchema = CourseSchema.array()
export type CourseListResBody = PaginatedResponse<z.infer<typeof CourseSchema>>
export type CourseListHandler = RequestHandler<never, CourseListResBody, never, CourseListReqQuery>

// Get Course
export const CourseGetReqParamsSchema = IdInputSchema
export type CourseGetReqParams = z.infer<typeof CourseGetReqParamsSchema>
export const CourseGetResBodySchema = CourseSchema
export type CourseGetResBody = z.infer<typeof CourseGetResBodySchema>
export type CourseGetHandler = RequestHandler<CourseGetReqParams, CourseGetResBody, never, never>


// Create Course
export const CourseCreateReqBodySchema = CourseSchema.extend({
    departments: z.array(z.string()),
    faculties: z.array(z.string()),
    topics: z.array(CourseTopicCreateSchema.omit({ course_id: true })),
})
export type CourseCreateReqBody = z.infer<typeof CourseCreateReqBodySchema>
export const CourseCreateResBodySchema = CourseSchema
export type CourseCreateResBody = z.infer<typeof CourseCreateResBodySchema>
export type CourseCreateHandler = RequestHandler<never, CourseCreateResBody, CourseCreateReqBody, never>


// Update Course
export const CourseUpdateReqParamsSchema = IdInputSchema
export type CourseUpdateReqParams = z.infer<typeof CourseUpdateReqParamsSchema>
export const CourseUpdateReqBodySchema = CourseCreateReqBodySchema.partial()
export type CourseUpdateReqBody = z.infer<typeof CourseUpdateReqBodySchema>
export const CourseUpdateResBodySchema = CourseSchema
export type CourseUpdateResBody = z.infer<typeof CourseUpdateResBodySchema>
export type CourseUpdateHandler = RequestHandler<CourseUpdateReqParams, CourseUpdateResBody, CourseUpdateReqBody, never>


// Delete Course
export const CourseDeleteReqParamsSchema = IdInputSchema
export type CourseDeleteReqParams = z.infer<typeof CourseDeleteReqParamsSchema>
export type CourseDeleteHandler = RequestHandler<CourseDeleteReqParams, void, never, never>;