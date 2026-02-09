import * as z from "zod";
import { RequestHandler } from "express";
import { PaginatedRequestSchema, PaginatedResponse } from "./pagination";
import { IdInputSchema } from "./id";
import { RequisiteRule } from "./generated/prisma/client";
import {
  RequisiteRuleCreateInputObjectZodSchema,
  RequisiteRuleScalarFieldEnumSchema,
  RequisiteRuleUpdateInputObjectZodSchema,
} from "./generated/zod/schemas";
import { getSortingReqQuerySchema } from "./sorting";


export interface RequisiteRuleValue {
  id: string
  condition: string
  values: (string | {
    logic: string
    value: string[]
  })[]
}

export interface RequisiteRuleData {
  id: string
  name?: string
  description?: string
  notes?: string
  condition: string
  minCourses?: number
  maxCourses?: number
  minCredits?: number
  maxCredits?: number
  credits?: number
  number?: number
  restriction?: number
  grade?: string
  gradeType?: string
  subRules: RequisiteRuleData[]
  value: RequisiteRuleValue
}

// List Requisite Rules
export const RequisiteRuleListReqQuerySchema = z.object({
  id: z.string().optional(),
  requisite_id: z.string().optional(),
  parent_rule_id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  condition: z.string().optional(),
  grade: z.string().optional(),
  grade_type: z.string().optional(),
  sorting: getSortingReqQuerySchema(RequisiteRuleScalarFieldEnumSchema),
}).extend(PaginatedRequestSchema.shape);
export type RequisiteRuleListReqQuery = z.infer<typeof RequisiteRuleListReqQuerySchema>;
export type RequisiteRuleListResBody = PaginatedResponse<RequisiteRule>;
export type RequisiteRuleListHandler = RequestHandler<never, RequisiteRuleListResBody, never, RequisiteRuleListReqQuery>;


// Get Requisite Rule
export const RequisiteRuleGetParamsSchema = IdInputSchema;
export type RequisiteRuleGetParams = z.infer<typeof RequisiteRuleGetParamsSchema>;
export type RequisiteRuleGetHandler = RequestHandler<RequisiteRuleGetParams, RequisiteRule, never, never>;


// Create Requisite Rule
export const RequisiteRuleCreateBodySchema = RequisiteRuleCreateInputObjectZodSchema;
export type RequisiteRuleCreateBody = z.infer<typeof RequisiteRuleCreateBodySchema>;
export type RequisiteRuleCreateHandler = RequestHandler<never, RequisiteRule, RequisiteRuleCreateBody, never>;


// Update Requisite Rule
export const RequisiteRuleUpdateParamsSchema = IdInputSchema;
export type RequisiteRuleUpdateParams = z.infer<typeof RequisiteRuleUpdateParamsSchema>;
export const RequisiteRuleUpdateBodySchema = RequisiteRuleUpdateInputObjectZodSchema;
export type RequisiteRuleUpdateBody = z.infer<typeof RequisiteRuleUpdateBodySchema>;
export type RequisiteRuleUpdateHandler = RequestHandler<RequisiteRuleUpdateParams, RequisiteRule, RequisiteRuleUpdateBody, never>;


// Delete Requisite Rule
export const RequisiteRuleDeleteParamsSchema = IdInputSchema;
export type RequisiteRuleDeleteParams = z.infer<typeof RequisiteRuleDeleteParamsSchema>;
export type RequisiteRuleDeleteHandler = RequestHandler<RequisiteRuleDeleteParams, void, never, never>;
