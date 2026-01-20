import * as z from "zod"
import { GradeMode, Career, RequisiteType } from "./generated/prisma/enums"

export const GradeModeSchema = z.enum(GradeMode)

export const CareerSchema = z.enum(Career)

export const RequisiteTypeSchema = z.enum(RequisiteType)
