import * as z from "zod";
import { RequestHandler } from "express";
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination";
import { IdInputSchema } from "./id";
import { Subject } from './generated/prisma/client';
import { SubjectCreateInputObjectZodSchema, SubjectScalarFieldEnumSchema, SubjectUpdateInputObjectZodSchema } from "./generated/zod/schemas";
import { getSortingReqQuerySchema } from "./sorting";

const SubjectRelationsSchema = z.object({
    departments: z.undefined(),
    faculties: z.undefined(),
    courses: z.undefined(),
    department_codes: z.string().array().optional(),
    faculty_codes: z.string().array().optional(),
});

// List Subjects
export const SubjectListReqQuerySchema = z.object({
    id: z.string().optional(),
    code: z.string().optional(),
    title: z.string().optional(),
    sorting: getSortingReqQuerySchema(SubjectScalarFieldEnumSchema),
}).extend(PaginatedRequestSchema.shape);
export type SubjectListReqQuery = z.infer<typeof SubjectListReqQuerySchema>;
export type SubjectListResBody = PaginatedResponse<Subject>;
export type SubjectListHandler = RequestHandler<never, SubjectListResBody, never, SubjectListReqQuery>;


// Get Subject
export const SubjectGetParamsSchema = IdInputSchema
export type SubjectGetParams = z.infer<typeof SubjectGetParamsSchema>;
export type SubjectGetHandler = RequestHandler<SubjectGetParams, Subject, never, never>;


// Create Subject
export const SubjectCreateBodySchema = SubjectCreateInputObjectZodSchema.extend(SubjectRelationsSchema.shape)
export type SubjectCreateBody = z.infer<typeof SubjectCreateBodySchema>;
export type SubjectCreateHandler = RequestHandler<never, Subject, SubjectCreateBody, never>;


// Update Subject
export const SubjectUpdateParamsSchema = IdInputSchema
export type SubjectUpdateParams = z.infer<typeof SubjectUpdateParamsSchema>;
export const SubjectUpdateBodySchema = SubjectUpdateInputObjectZodSchema.extend(SubjectRelationsSchema.shape)
export type SubjectUpdateBody = z.infer<typeof SubjectUpdateBodySchema>;
export type SubjectUpdateHandler = RequestHandler<SubjectUpdateParams, Subject, SubjectUpdateBody, never>;


// Delete Subject
export const SubjectDeleteParamsSchema = IdInputSchema
export type SubjectDeleteParams = z.infer<typeof SubjectDeleteParamsSchema>;
export type SubjectDeleteHandler = RequestHandler<SubjectDeleteParams, void, never, never>;
