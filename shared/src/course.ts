import z from 'zod'
import { type RequestHandler } from 'express';
import { CourseTopicCreateSchema } from './course-topic'
import { PaginatedRequestSchema, PaginatedResponse } from './pagination'
import { IdInputSchema } from './id';
import { getSortingReqQuerySchema } from './sorting';
import { Course } from './generated/prisma/client';
import { CourseScalarFieldEnumSchema, CourseCreateInputObjectZodSchema, CourseUpdateInputObjectZodSchema } from './generated/zod/schemas';

const CourseRelationsSchema = z.object({
    subject: z.string(),
    departments: z.string().array().optional(),
    faculties: z.string().array().optional(),
    topics: z.array(CourseTopicCreateSchema.omit({ course_id: true })).optional(),
});


// List Courses
export const CourseListReqQuerySchema = z.object({
    keywords: z.string().optional(),
    sorting: getSortingReqQuerySchema(CourseScalarFieldEnumSchema),
}).extend(PaginatedRequestSchema.shape)
export type CourseListReqQuery = z.infer<typeof CourseListReqQuerySchema>
export type CourseListResBody = PaginatedResponse<Course>
export type CourseListHandler = RequestHandler<never, CourseListResBody, never, CourseListReqQuery>


// Get Course
export const CourseGetReqParamsSchema = IdInputSchema
export type CourseGetReqParams = z.infer<typeof CourseGetReqParamsSchema>
export type CourseGetHandler = RequestHandler<CourseGetReqParams, Course, never, never>


// Create Course
export const CourseCreateReqBodySchema = CourseCreateInputObjectZodSchema.extend(CourseRelationsSchema.shape)
export type CourseCreateReqBody = z.infer<typeof CourseCreateReqBodySchema>
export type CourseCreateHandler = RequestHandler<never, Course, CourseCreateReqBody, never>


// Update Course
export const CourseUpdateReqParamsSchema = IdInputSchema
export type CourseUpdateReqParams = z.infer<typeof CourseUpdateReqParamsSchema>
export const CourseUpdateReqBodySchema = CourseUpdateInputObjectZodSchema.extend(CourseRelationsSchema.loose().shape)
export type CourseUpdateReqBody = z.infer<typeof CourseUpdateReqBodySchema>
export type CourseUpdateHandler = RequestHandler<CourseUpdateReqParams, Course, CourseUpdateReqBody, never>


// Delete Course
export const CourseDeleteReqParamsSchema = IdInputSchema
export type CourseDeleteReqParams = z.infer<typeof CourseDeleteReqParamsSchema>
export type CourseDeleteHandler = RequestHandler<CourseDeleteReqParams, void, never, never>;
