import * as z from "zod";
import { RequestHandler } from "express";
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination";
import { IdInputSchema } from "./id";
import { Faculty } from './generated/prisma/client';
import { FacultyCreateInputObjectZodSchema, FacultyScalarFieldEnumSchema, FacultyUpdateInputObjectZodSchema } from "./generated/zod/schemas";
import { getSortingReqQuerySchema } from "./sorting";


// List Faculties
export const FacultyListReqQuerySchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    display_name: z.string().optional(),
    code: z.string().optional(),
    is_active: z.boolean().optional(),
    sorting: getSortingReqQuerySchema(FacultyScalarFieldEnumSchema),
}).extend(PaginatedRequestSchema.shape);
export type FacultyListReqQuery = z.infer<typeof FacultyListReqQuerySchema>;
export type FacultyListResBody = PaginatedResponse<Faculty>;
export type FacultyListHandler = RequestHandler<never, FacultyListResBody, never, FacultyListReqQuery>;


// Get Faculty
export const FacultyGetParamsSchema = IdInputSchema
export type FacultyGetParams = z.infer<typeof FacultyGetParamsSchema>;
export type FacultyGetHandler = RequestHandler<FacultyGetParams, Faculty, never, never>;


// Create Faculty
export const FacultyCreateBodySchema = FacultyCreateInputObjectZodSchema
export type FacultyCreateBody = z.infer<typeof FacultyCreateBodySchema>;
export type FacultyCreateHandler = RequestHandler<never, Faculty, FacultyCreateBody, never>;


// Update Faculty
export const FacultyUpdateParamsSchema = IdInputSchema
export type FacultyUpdateParams = z.infer<typeof FacultyUpdateParamsSchema>;
export const FacultyUpdateBodySchema = FacultyUpdateInputObjectZodSchema
export type FacultyUpdateBody = z.infer<typeof FacultyUpdateBodySchema>;
export type FacultyUpdateHandler = RequestHandler<FacultyUpdateParams, Faculty, FacultyUpdateBody, never>;


// Delete Faculty
export const FacultyDeleteParamsSchema = IdInputSchema
export type FacultyDeleteParams = z.infer<typeof FacultyDeleteParamsSchema>;
export type FacultyDeleteHandler = RequestHandler<FacultyDeleteParams, void, never, never>;
