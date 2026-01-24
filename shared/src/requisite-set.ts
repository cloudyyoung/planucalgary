import * as z from "zod";
import { RequestHandler } from "express";
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination";
import { IdInputSchema } from "./id";
import { RequisiteSet } from './generated/prisma/client';
import { RequisiteSetCreateInputObjectZodSchema, RequisiteSetScalarFieldEnumSchema, RequisiteSetUpdateInputObjectZodSchema } from "./generated/zod/schemas";
import { getSortingReqQuerySchema } from "./sorting";


// List Requisite Sets
export const RequisiteSetListReqQuerySchema = z.object({
    id: z.string().optional(),
    csid: z.string().optional(),
    requisite_set_group_id: z.string().optional(),
    version: z.number().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    sorting: getSortingReqQuerySchema(RequisiteSetScalarFieldEnumSchema),
}).extend(PaginatedRequestSchema.shape);
export type RequisiteSetListReqQuery = z.infer<typeof RequisiteSetListReqQuerySchema>;
export type RequisiteSetListResBody = PaginatedResponse<RequisiteSet>;
export type RequisiteSetListHandler = RequestHandler<never, RequisiteSetListResBody, never, RequisiteSetListReqQuery>;


// Get Requisite Set
export const RequisiteSetGetParamsSchema = IdInputSchema
export type RequisiteSetGetParams = z.infer<typeof RequisiteSetGetParamsSchema>;
export type RequisiteSetGetHandler = RequestHandler<RequisiteSetGetParams, RequisiteSet, never, never>;


// Create Requisite Set
export const RequisiteSetCreateBodySchema = RequisiteSetCreateInputObjectZodSchema
export type RequisiteSetCreateBody = z.infer<typeof RequisiteSetCreateBodySchema>;
export type RequisiteSetCreateHandler = RequestHandler<never, RequisiteSet, RequisiteSetCreateBody, never>;


// Update Requisite Set
export const RequisiteSetUpdateParamsSchema = IdInputSchema
export type RequisiteSetUpdateParams = z.infer<typeof RequisiteSetUpdateParamsSchema>;
export const RequisiteSetUpdateBodySchema = RequisiteSetUpdateInputObjectZodSchema
export type RequisiteSetUpdateBody = z.infer<typeof RequisiteSetUpdateBodySchema>;
export type RequisiteSetUpdateHandler = RequestHandler<RequisiteSetUpdateParams, RequisiteSet, RequisiteSetUpdateBody, never>;


// Delete Requisite Set
export const RequisiteSetDeleteParamsSchema = IdInputSchema
export type RequisiteSetDeleteParams = z.infer<typeof RequisiteSetDeleteParamsSchema>;
export type RequisiteSetDeleteHandler = RequestHandler<RequisiteSetDeleteParams, void, never, never>;
