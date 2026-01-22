import * as z from "zod";
import { RequestHandler } from "express";
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination";
import { IdInputSchema } from "./id";
import { CourseSet } from './generated/prisma/client';
import { CourseSetCreateInputObjectZodSchema, CourseSetUpdateInputObjectZodSchema } from "./generated/zod/schemas";


// List Course Sets
export enum CourseSetType {
    STATIC = "static",
    DYNAMIC = "dynamic",
}
export const CourseSetTypeSchema = z.enum(CourseSetType);
export const CourseSetListQuerySchema = z.object({
    id: z.string().optional(),
    type: CourseSetTypeSchema.optional(),
    course_set_group_id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    csid: z.string().optional(),
}).extend(PaginatedRequestSchema.shape);
export type CourseSetListQuery = z.infer<typeof CourseSetListQuerySchema>;
export type CourseSetListResBody = PaginatedResponse<CourseSet>;
export type CourseSetListHandler = RequestHandler<never, CourseSetListResBody, never, CourseSetListQuery>;


// Get Course Set
export const CourseSetGetParamsSchema = IdInputSchema
export type CourseSetGetParams = z.infer<typeof CourseSetGetParamsSchema>;
export type CourseSetGetHandler = RequestHandler<CourseSetGetParams, CourseSet, never, never>;


// Create Course Set
export const CourseSetCreateBodySchema = CourseSetCreateInputObjectZodSchema
export type CourseSetCreateBody = z.infer<typeof CourseSetCreateBodySchema>;
export type CourseSetCreateHandler = RequestHandler<never, CourseSet, CourseSetCreateBody, never>;


// Update Course Set
export const CourseSetUpdateParamsSchema = IdInputSchema
export type CourseSetUpdateParams = z.infer<typeof CourseSetUpdateParamsSchema>;
export const CourseSetUpdateBodySchema = CourseSetUpdateInputObjectZodSchema
export type CourseSetUpdateBody = z.infer<typeof CourseSetUpdateBodySchema>;
export type CourseSetUpdateHandler = RequestHandler<CourseSetUpdateParams, CourseSet, CourseSetUpdateBody, never>;


// Delete Course Set
export const CourseSetDeleteParamsSchema = IdInputSchema
export type CourseSetDeleteParams = z.infer<typeof CourseSetDeleteParamsSchema>;
export type CourseSetDeleteHandler = RequestHandler<CourseSetDeleteParams, void, never, never>;
