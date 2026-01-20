import * as z from "zod"
import { type RequestHandler } from "express"
import { RequisiteTypeSchema } from "./enums"
import { IdInputSchema } from "./id"
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination"
import { getSortableColumns } from "./sorting"

export const RequisiteSchema = z.object({
    id: z.uuid().readonly(),
    requisite_type: RequisiteTypeSchema,
    text: z.string(),
    departments: z.array(z.string()),
    faculties: z.array(z.string()),
    json: z.json().nullable(),
    json_choices: z.json().array(),
    json_valid: z.boolean(),
    json_errors: z.object({
        message: z.string(),
        value: z.any().nullable(),
    }).array(),
    json_warnings: z.object({
        message: z.string(),
        value: z.any().nullable(),
    }).array(),
    updated_at: z.date().readonly(),
    created_at: z.date().readonly(),
})
export type Requisite = z.infer<typeof RequisiteSchema>

// List Requisites
export const RequisiteListReqQuerySchema = z.object({
    requisite_type: RequisiteTypeSchema.optional(),
    sorting: z.enum(getSortableColumns(RequisiteSchema.keyof().options)).array().optional(),
}).extend(PaginatedRequestSchema.shape)
export type RequisiteListReqQuery = z.infer<typeof RequisiteListReqQuerySchema>
export const RequisiteListResBodySchema = RequisiteSchema.array()
export type RequisiteListResBody = PaginatedResponse<z.infer<typeof RequisiteSchema>>
export type RequisiteListHandler = RequestHandler<never, unknown, never, RequisiteListReqQuery>

// Sync Requisites
export const RequisitesSyncReqBodySchema = z.object({
    destination: z.enum(["requisites_jsons", "courses", "course_sets"]),
})
export type RequisitesSyncReqBody = z.infer<typeof RequisitesSyncReqBodySchema>
export type RequisitesSyncHandler = RequestHandler<never, unknown, RequisitesSyncReqBody, never>

// Get Requisite
export const RequisiteGetReqParamsSchema = IdInputSchema
export type RequisiteGetReqParams = z.infer<typeof RequisiteGetReqParamsSchema>
export const RequisiteGetResBodySchema = RequisiteSchema
export type RequisiteGetResBody = z.infer<typeof RequisiteGetResBodySchema>
export type RequisiteGetHandler = RequestHandler<RequisiteGetReqParams, RequisiteGetResBody>

// Update Requisite
export const RequsiteUpdateReqParamsSchema = IdInputSchema
export type RequisiteUpdateReqParams = z.infer<typeof RequsiteUpdateReqParamsSchema>
export const RequisiteUpdateReqBodySchema = z.object({
    json: z.json().nullable(),
})
export type RequisiteUpdateReqBody = z.infer<typeof RequisiteUpdateReqBodySchema>
export const RequisiteUpdateResBodySchema = RequisiteSchema
export type RequisiteUpdateResBody = z.infer<typeof RequisiteUpdateResBodySchema>
export type RequisiteUpdateHandler = RequestHandler<RequisiteUpdateReqParams, RequisiteUpdateResBody, RequisiteUpdateReqBody, never>

// Generate Requisite Choices
export const RequisiteGenerateChoicesReqParamsSchema = IdInputSchema
export type RequisiteGenerateChoicesReqParams = z.infer<typeof RequisiteGenerateChoicesReqParamsSchema>
export const RequisiteGenerateChoicesResBodySchema = RequisiteSchema
export type RequisiteGenerateChoicesResBody = z.infer<typeof RequisiteGenerateChoicesResBodySchema>
export type RequisiteGenerateChoicesHandler = RequestHandler<RequisiteGenerateChoicesReqParams, RequisiteGenerateChoicesResBody, never, never>
