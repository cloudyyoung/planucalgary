import * as z from "zod"

export const GradeNodeSchema = z.enum(["CDF", "CNC", "CRF", "ELG", "GRD", "MTG"])
export type GradeNode = z.infer<typeof GradeNodeSchema>

export const CareerSchema = z.enum(["UNDERGRADUATE_PROGRAM", "GRADUATE_PROGRAM", "MEDICINE_PROGRAM"])
export type Career = z.infer<typeof CareerSchema>
