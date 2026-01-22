import * as z from "zod"
import { type RequestHandler } from "express"
import { IdInputSchema } from "./id"
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination"
import { getSortingReqQuerySchema } from "./sorting"
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
    id: z.string().optional(),
    requisite_type: RequisiteTypeSchema.optional(),
    text: z.string().optional(),
    sorting: getSortingReqQuerySchema(RequisiteJsonScalarFieldEnumSchema),
}).extend(PaginatedRequestSchema.shape)
export type RequisiteListReqQuery = z.infer<typeof RequisiteListReqQuerySchema>
export type RequisiteListResBody = PaginatedResponse<RequisiteJson & RequisiteJsonValidation>
export type RequisiteListHandler = RequestHandler<never, RequisiteListResBody, never, RequisiteListReqQuery>


// Sync Requisites
export enum RequisitesSyncDestination {
    REQUISITES_JSONS = "REQUISITES_JSONS",
    COURSES = "COURSES",
    COURSE_SETS = "COURSE_SETS",
}
export const RequisitesSyncDestinationSchema = z.enum(RequisitesSyncDestination)
export const RequisitesSyncReqBodySchema = z.object({
    destination: RequisitesSyncDestinationSchema,
})
export type RequisitesSyncReqBody = z.infer<typeof RequisitesSyncReqBodySchema>
export type RequisitesSyncResBody = {
    message: string
    affected_rows: number
}
export type RequisitesSyncHandler = RequestHandler<never, RequisitesSyncResBody, RequisitesSyncReqBody, never>


// Get Requisite
export const RequisiteGetReqParamsSchema = IdInputSchema
export type RequisiteGetReqParams = z.infer<typeof RequisiteGetReqParamsSchema>
export type RequisiteGetResBody = RequisiteJson & RequisiteJsonValidation
export type RequisiteGetHandler = RequestHandler<RequisiteGetReqParams, RequisiteGetResBody, never, never>


// Update Requisite
export const RequsiteUpdateReqParamsSchema = IdInputSchema
export type RequisiteUpdateReqParams = z.infer<typeof RequsiteUpdateReqParamsSchema>
export const RequisiteUpdateReqBodySchema = RequisiteJsonUpdateInputObjectZodSchema
export type RequisiteUpdateReqBody = z.infer<typeof RequisiteUpdateReqBodySchema>
export type RequisiteUpdateResBody = RequisiteJson & RequisiteJsonValidation
export type RequisiteUpdateHandler = RequestHandler<RequisiteUpdateReqParams, RequisiteUpdateResBody, RequisiteUpdateReqBody, never>


// Generate Requisite Choices
export const RequisiteGenerateChoicesReqParamsSchema = IdInputSchema
export type RequisiteGenerateChoicesReqParams = z.infer<typeof RequisiteGenerateChoicesReqParamsSchema>
export type RequisiteGenerateChoicesResBody = RequisiteJson & RequisiteJsonValidation
export type RequisiteGenerateChoicesHandler = RequestHandler<RequisiteGenerateChoicesReqParams, RequisiteGenerateChoicesResBody, never, never>
