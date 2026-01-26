import * as z from "zod";
import { RequestHandler } from "express";
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination";
import { IdInputSchema } from "./id";
import { FieldsOfStudy } from './generated/prisma/client';
import { FieldsOfStudyCreateInputObjectZodSchema, FieldsOfStudyScalarFieldEnumSchema, FieldsOfStudyUpdateInputObjectZodSchema } from "./generated/zod/schemas";
import { getSortingReqQuerySchema } from "./sorting";


// List Fields Of Study
export const FieldsOfStudyListReqQuerySchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    sorting: getSortingReqQuerySchema(FieldsOfStudyScalarFieldEnumSchema),
}).extend(PaginatedRequestSchema.shape);
export type FieldsOfStudyListReqQuery = z.infer<typeof FieldsOfStudyListReqQuerySchema>;
export type FieldsOfStudyListResBody = PaginatedResponse<FieldsOfStudy>;
export type FieldsOfStudyListHandler = RequestHandler<never, FieldsOfStudyListResBody, never, FieldsOfStudyListReqQuery>;


// Get Field Of Study
export const FieldsOfStudyGetParamsSchema = IdInputSchema
export type FieldsOfStudyGetParams = z.infer<typeof FieldsOfStudyGetParamsSchema>;
export type FieldsOfStudyGetHandler = RequestHandler<FieldsOfStudyGetParams, FieldsOfStudy, never, never>;


// Create Field Of Study
export const FieldsOfStudyCreateBodySchema = FieldsOfStudyCreateInputObjectZodSchema
export type FieldsOfStudyCreateBody = z.infer<typeof FieldsOfStudyCreateBodySchema>;
export type FieldsOfStudyCreateHandler = RequestHandler<never, FieldsOfStudy, FieldsOfStudyCreateBody, never>;


// Update Field Of Study
export const FieldsOfStudyUpdateParamsSchema = IdInputSchema
export type FieldsOfStudyUpdateParams = z.infer<typeof FieldsOfStudyUpdateParamsSchema>;
export const FieldsOfStudyUpdateBodySchema = FieldsOfStudyUpdateInputObjectZodSchema
export type FieldsOfStudyUpdateBody = z.infer<typeof FieldsOfStudyUpdateBodySchema>;
export type FieldsOfStudyUpdateHandler = RequestHandler<FieldsOfStudyUpdateParams, FieldsOfStudy, FieldsOfStudyUpdateBody, never>;


// Delete Field Of Study
export const FieldsOfStudyDeleteParamsSchema = IdInputSchema
export type FieldsOfStudyDeleteParams = z.infer<typeof FieldsOfStudyDeleteParamsSchema>;
export type FieldsOfStudyDeleteHandler = RequestHandler<FieldsOfStudyDeleteParams, void, never, never>;
