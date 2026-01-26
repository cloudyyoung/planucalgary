import * as z from "zod";
import { RequestHandler } from "express";
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination";
import { IdInputSchema } from "./id";
import { CourseSet, FieldOfStudy } from './generated/prisma/client';
import { FieldOfStudyCreateInputObjectZodSchema, FieldOfStudyScalarFieldEnumSchema, FieldOfStudyUpdateInputObjectZodSchema } from "./generated/zod/schemas";
import { getSortingReqQuerySchema } from "./sorting";


// List Fields Of Study
export const FieldsOfStudyListReqQuerySchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    sorting: getSortingReqQuerySchema(FieldOfStudyScalarFieldEnumSchema),
}).extend(PaginatedRequestSchema.shape);
export type FieldsOfStudyListReqQuery = z.infer<typeof FieldsOfStudyListReqQuerySchema>;
export type FieldsOfStudyListResBody = PaginatedResponse<FieldOfStudy & { course_sets: CourseSet[] }>;
export type FieldsOfStudyListHandler = RequestHandler<never, FieldsOfStudyListResBody, never, FieldsOfStudyListReqQuery>;


// Get Field Of Study
export const FieldsOfStudyGetParamsSchema = IdInputSchema
export type FieldsOfStudyGetParams = z.infer<typeof FieldsOfStudyGetParamsSchema>;
export type FieldsOfStudyGetHandler = RequestHandler<FieldsOfStudyGetParams, FieldOfStudy & { course_sets: CourseSet[] }, never, never>;


// Create Field Of Study
export const FieldsOfStudyCreateBodySchema = FieldOfStudyCreateInputObjectZodSchema
export type FieldsOfStudyCreateBody = z.infer<typeof FieldsOfStudyCreateBodySchema>;
export type FieldsOfStudyCreateHandler = RequestHandler<never, FieldOfStudy & { course_sets: CourseSet[] }, FieldsOfStudyCreateBody, never>;


// Update Field Of Study
export const FieldsOfStudyUpdateParamsSchema = IdInputSchema
export type FieldsOfStudyUpdateParams = z.infer<typeof FieldsOfStudyUpdateParamsSchema>;
export const FieldsOfStudyUpdateBodySchema = FieldOfStudyUpdateInputObjectZodSchema
export type FieldsOfStudyUpdateBody = z.infer<typeof FieldsOfStudyUpdateBodySchema>;
export type FieldsOfStudyUpdateHandler = RequestHandler<FieldsOfStudyUpdateParams, FieldOfStudy & { course_sets: CourseSet[] }, FieldsOfStudyUpdateBody, never>;

// Delete Field Of Study
export const FieldsOfStudyDeleteParamsSchema = IdInputSchema
export type FieldsOfStudyDeleteParams = z.infer<typeof FieldsOfStudyDeleteParamsSchema>;
export type FieldsOfStudyDeleteHandler = RequestHandler<FieldsOfStudyDeleteParams, void, never, never>;
