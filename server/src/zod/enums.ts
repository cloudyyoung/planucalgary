import { z } from "zod"

export const CourseComponentEnum = z.enum(["LAB", "LECTURE", "SECTION", "SEMINAR", "SUPERVISED_STUDY", "TUTORIAL"])
export type CourseComponent = z.infer<typeof CourseComponentEnum>

export const CareerEnum = z.enum(["UNDERGRADUATE_PROGRAM", "GRADUATE_PROGRAM", "MEDICINE_PROGRAM"])
export type Career = z.infer<typeof CareerEnum>

export const RequisiteTypeEnum = z.enum(["PREREQ", "COREQ", "ANTIREQ", "COURSE_SET", "REQUISITE_SET"])
export type RequisiteType = z.infer<typeof RequisiteTypeEnum>

export const GradeModeEnum = z.enum(["CDF", "CNC", "CRF", "ELG", "GRD", "MTG"])
export type GradeMode = z.infer<typeof GradeModeEnum>

export const TermNameEnum = z.enum(["WINTER", "SPRING", "SUMMER", "FALL"])
export type TermName = z.infer<typeof TermNameEnum>
