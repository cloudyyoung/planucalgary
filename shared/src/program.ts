import * as z from "zod"
import { RequestHandler } from "express"
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination"
import { IdInputSchema } from "./id"
import { Program } from './generated/prisma/client'
import { CareerSchema, ProgramCreateInputObjectZodSchema, ProgramScalarFieldEnumSchema, ProgramUpdateInputObjectZodSchema } from "./generated/zod/schemas"
import { getSortingReqQuerySchema } from "./sorting"

// List Programs
export const ProgramListReqQuerySchema = z.object({
    id: z.string().optional(),
    code: z.string().optional(),
    name: z.string().optional(),
    pid: z.string().optional(),
    is_active: z.coerce.boolean().optional(),
    sorting: getSortingReqQuerySchema(ProgramScalarFieldEnumSchema),
}).extend(PaginatedRequestSchema.shape);
export type ProgramListReqQuery = z.infer<typeof ProgramListReqQuerySchema>;
export type ProgramListResBody = PaginatedResponse<Program>;
export type ProgramListHandler = RequestHandler<never, ProgramListResBody, never, ProgramListReqQuery>;


// Get Program
export const ProgramGetParamsSchema = IdInputSchema
export type ProgramGetParams = z.infer<typeof ProgramGetParamsSchema>;
export type ProgramGetHandler = RequestHandler<ProgramGetParams, Program, never, never>;


// Create Program
export const ProgramCreateBodySchema = ProgramCreateInputObjectZodSchema
export type ProgramCreateBody = z.infer<typeof ProgramCreateBodySchema>;
export type ProgramCreateHandler = RequestHandler<never, Program, ProgramCreateBody, never>;


// Update Program
export const ProgramUpdateParamsSchema = IdInputSchema
export type ProgramUpdateParams = z.infer<typeof ProgramUpdateParamsSchema>;
export const ProgramUpdateBodySchema = ProgramUpdateInputObjectZodSchema
export type ProgramUpdateBody = z.infer<typeof ProgramUpdateBodySchema>;
export type ProgramUpdateHandler = RequestHandler<ProgramUpdateParams, Program, ProgramUpdateBody, never>;


// Delete Program
export const ProgramDeleteParamsSchema = IdInputSchema
export type ProgramDeleteParams = z.infer<typeof ProgramDeleteParamsSchema>;
export type ProgramDeleteHandler = RequestHandler<ProgramDeleteParams, void, never, never>;
