import * as z from "zod";
import { RequestHandler } from "express";
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination";
import { Department } from './generated/prisma/client';
import { DepartmentCreateInputObjectZodSchema, DepartmentScalarFieldEnumSchema, DepartmentWhereInputObjectZodSchema, DepartmentUpdateInputObjectZodSchema, DepartmentWhereUniqueInputObjectZodSchema } from "./generated/zod/schemas";
import { getSortingReqQuerySchema } from "./sorting";


// List Departments
export const DepartmentListReqQuerySchema = DepartmentWhereInputObjectZodSchema.pick({
    name: true,
    display_name: true,
    code: true,
    is_active: true,
}).extend(PaginatedRequestSchema.shape).extend({
    sorting: getSortingReqQuerySchema(DepartmentScalarFieldEnumSchema),
})
export type DepartmentListReqQuery = z.infer<typeof DepartmentListReqQuerySchema>;
export type DepartmentListResBody = PaginatedResponse<Department>;
export type DepartmentListHandler = RequestHandler<never, DepartmentListResBody, never, DepartmentListReqQuery>;


// Get Department
export const DepartmentGetParamsSchema = DepartmentWhereUniqueInputObjectZodSchema
export type DepartmentGetParams = z.infer<typeof DepartmentGetParamsSchema>;
export type DepartmentGetHandler = RequestHandler<DepartmentGetParams, Department, never, never>;


// Create Department
export const DepartmentCreateBodySchema = DepartmentCreateInputObjectZodSchema
export type DepartmentCreateBody = z.infer<typeof DepartmentCreateBodySchema>;
export type DepartmentCreateHandler = RequestHandler<never, Department, DepartmentCreateBody, never>;


// Update Department
export const DepartmentUpdateParamsSchema = DepartmentWhereUniqueInputObjectZodSchema
export type DepartmentUpdateParams = z.infer<typeof DepartmentUpdateParamsSchema>;
export const DepartmentUpdateBodySchema = DepartmentUpdateInputObjectZodSchema
export type DepartmentUpdateBody = z.infer<typeof DepartmentUpdateBodySchema>;
export type DepartmentUpdateHandler = RequestHandler<DepartmentUpdateParams, Department, DepartmentUpdateBody, never>;


// Delete Department
export const DepartmentDeleteParamsSchema = DepartmentWhereUniqueInputObjectZodSchema
export type DepartmentDeleteParams = z.infer<typeof DepartmentDeleteParamsSchema>;
export type DepartmentDeleteHandler = RequestHandler<DepartmentDeleteParams, void, never, never>;
