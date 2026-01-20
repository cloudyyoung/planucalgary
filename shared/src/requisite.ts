import * as z from "zod"
import { type RequestHandler } from "express"
import { IdInputSchema } from "./id"
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination"
import { getSortableColumns } from "./sorting"
import { RequisiteJson } from "./generated/prisma/client"
import { RequisiteJsonScalarFieldEnumSchema, RequisiteTypeSchema, RequisiteJsonUpdateInputObjectZodSchema } from "./generated/zod/schemas"

export { RequisiteTypeSchema }

export interface RequisiteJsonValidationMessage {
    message: string
    value: any
}

export interface RequisiteJsonValidation {
    json_valid: boolean
    json_errors: RequisiteJsonValidationMessage[]
    json_warnings: RequisiteJsonValidationMessage[]
}

// List Requisites
export const RequisiteListReqQuerySchema = z.object({
    requisite_type: RequisiteTypeSchema.optional(),
    sorting: z.enum(getSortableColumns(RequisiteJsonScalarFieldEnumSchema.options)).array().optional(),
}).extend(PaginatedRequestSchema.shape)
export type RequisiteListReqQuery = z.infer<typeof RequisiteListReqQuerySchema>
export type RequisiteListResBody = PaginatedResponse<RequisiteJson & RequisiteJsonValidation>
export type RequisiteListHandler = RequestHandler<never, RequisiteListResBody, never, RequisiteListReqQuery>


// Sync Requisites
export const RequisitesSyncReqBodySchema = z.object({
    destination: z.enum(["requisites_jsons", "courses", "course_sets"]),
})
export type RequisitesSyncReqBody = z.infer<typeof RequisitesSyncReqBodySchema>
export type RequisitesSyncHandler = RequestHandler<never, never, RequisitesSyncReqBody, never>


// Get Requisite
export const RequisiteGetReqParamsSchema = IdInputSchema
export type RequisiteGetReqParams = z.infer<typeof RequisiteGetReqParamsSchema>
export type RequisiteGetHandler = RequestHandler<RequisiteGetReqParams, RequisiteJson & RequisiteJsonValidation, never, never>


// Update Requisite
export const RequsiteUpdateReqParamsSchema = IdInputSchema
export type RequisiteUpdateReqParams = z.infer<typeof RequsiteUpdateReqParamsSchema>
export const RequisiteUpdateReqBodySchema = RequisiteJsonUpdateInputObjectZodSchema
export type RequisiteUpdateReqBody = z.infer<typeof RequisiteUpdateReqBodySchema>
export type RequisiteUpdateHandler = RequestHandler<RequisiteUpdateReqParams, RequisiteJson, RequisiteUpdateReqBody, never>


// Generate Requisite Choices
export const RequisiteGenerateChoicesReqParamsSchema = IdInputSchema
export type RequisiteGenerateChoicesReqParams = z.infer<typeof RequisiteGenerateChoicesReqParamsSchema>
export type RequisiteGenerateChoicesHandler = RequestHandler<RequisiteGenerateChoicesReqParams, RequisiteJson, never, never>
