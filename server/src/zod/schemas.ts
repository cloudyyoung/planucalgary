import { z } from "zod"
import * as utils from "./utils"
import * as enums from "./enums"

/**
 *
 * Course
 *
 */

export const CourseCreateSchema = z.object({
  cid: z.string(),
  code: z.string(),
  course_number: z.string(),
  subject_code: z.string(),
  description: z.string().nullish().optional(),
  name: z.string(),
  long_name: z.string(),
  notes: z.string().nullish().optional(),
  version: z.number(),
  units: z.number().nullish().optional(),
  aka: z.string().nullish().optional(),
  prereq: z.string().nullish().optional(),
  prereq_json: utils.JsonSchema.optional(),
  coreq: z.string().nullish().optional(),
  coreq_json: utils.JsonSchema.optional(),
  antireq: z.string().nullish().optional(),
  antireq_json: utils.JsonSchema.optional(),
  is_active: z.boolean(),
  is_multi_term: z.boolean(),
  is_nogpa: z.boolean(),
  is_repeatable: z.boolean(),
  components: z.array(enums.CourseComponentEnum),
  course_group_id: z.string(),
  coursedog_id: z.string(),
  course_created_at: z.coerce.date(),
  course_effective_start_date: z.coerce.date(),
  course_last_updated_at: z.coerce.date(),
  career: enums.CareerEnum,
  grade_mode: enums.GradeModeEnum,
})

export type CourseCreate = z.infer<typeof CourseCreateSchema>

export const CourseUpdateSchema = CourseCreateSchema.partial()

export type CourseUpdate = z.infer<typeof CourseUpdateSchema>

export const CourseReadSchema = z.object({
  id: z.string(),
})

export type CourseRead = z.infer<typeof CourseReadSchema>

export const CourseDeleteSchema = z.object({
  id: z.string(),
})

export type CourseDelete = z.infer<typeof CourseDeleteSchema>

/**
 *
 * CourseTopic
 *
 */

export const CourseTopicCreateSchema = z.object({
  number: z.string(),
  name: z.string(),
  long_name: z.string(),
  description: z.string().nullish().optional(),
  is_repeatable: z.boolean(),
  units: z.number().nullish().optional(),
  link: z.string(),
  course_id: z.string(),
})

export type CourseTopicCreate = z.infer<typeof CourseTopicCreateSchema>

export const CourseTopicUpdateSchema = CourseTopicCreateSchema.partial()

export type CourseTopicUpdate = z.infer<typeof CourseTopicUpdateSchema>

export const CourseTopicReadSchema = z.object({
  id: z.string(),
})

export type CourseTopicRead = z.infer<typeof CourseTopicReadSchema>

export const CourseTopicDeleteSchema = z.object({
  id: z.string(),
})

export type CourseTopicDelete = z.infer<typeof CourseTopicDeleteSchema>

/**
 *
 * CourseSet
 *
 */

export const CourseSetCreateSchema = z.object({
  csid: z.string(),
  course_set_group_id: z.string(),
  type: z.string(),
  name: z.string(),
  description: z.string().nullish().optional(),
  json: utils.JsonSchema.optional(),
  course_set_created_at: z.coerce.date(),
  course_set_last_updated_at: z.coerce.date(),
})

export type CourseSetCreate = z.infer<typeof CourseSetCreateSchema>

export const CourseSetUpdateSchema = CourseSetCreateSchema.partial()

export type CourseSetUpdate = z.infer<typeof CourseSetUpdateSchema>

export const CourseSetReadSchema = z.object({
  id: z.string(),
})

export type CourseSetRead = z.infer<typeof CourseSetReadSchema>

export const CourseSetDeleteSchema = z.object({
  id: z.string(),
})

export type CourseSetDelete = z.infer<typeof CourseSetDeleteSchema>

/**
 *
 * RequisiteJson
 *
 */

export const RequisiteJsonCreateSchema = z.object({
  requisite_type: enums.RequisiteTypeEnum,
  text: z.string(),
  departments: z.array(z.string()),
  faculties: z.array(z.string()),
  json_choices: z.array(utils.JsonSchema),
  json: utils.JsonSchema.optional(),
})

export type RequisiteJsonCreate = z.infer<typeof RequisiteJsonCreateSchema>

export const RequisiteJsonUpdateSchema = RequisiteJsonCreateSchema.partial()

export type RequisiteJsonUpdate = z.infer<typeof RequisiteJsonUpdateSchema>

export const RequisiteJsonReadSchema = z.object({
  id: z.string(),
})

export type RequisiteJsonRead = z.infer<typeof RequisiteJsonReadSchema>

export const RequisiteJsonDeleteSchema = z.object({
  id: z.string(),
})

export type RequisiteJsonDelete = z.infer<typeof RequisiteJsonDeleteSchema>

/**
 *
 * Faculty
 *
 */

export const FacultyCreateSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  code: z.string(),
  is_active: z.boolean(),
})

export type FacultyCreate = z.infer<typeof FacultyCreateSchema>

export const FacultyUpdateSchema = FacultyCreateSchema.partial()

export type FacultyUpdate = z.infer<typeof FacultyUpdateSchema>

export const FacultyReadSchema = z.object({
  id: z.string(),
})

export type FacultyRead = z.infer<typeof FacultyReadSchema>

export const FacultyDeleteSchema = z.object({
  id: z.string(),
})

export type FacultyDelete = z.infer<typeof FacultyDeleteSchema>

/**
 *
 * Department
 *
 */

export const DepartmentCreateSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  code: z.string(),
  is_active: z.boolean(),
})

export type DepartmentCreate = z.infer<typeof DepartmentCreateSchema>

export const DepartmentUpdateSchema = DepartmentCreateSchema.partial()

export type DepartmentUpdate = z.infer<typeof DepartmentUpdateSchema>

export const DepartmentReadSchema = z.object({
  id: z.string(),
})

export type DepartmentRead = z.infer<typeof DepartmentReadSchema>

export const DepartmentDeleteSchema = z.object({
  id: z.string(),
})

export type DepartmentDelete = z.infer<typeof DepartmentDeleteSchema>

/**
 *
 * Subject
 *
 */

export const SubjectCreateSchema = z.object({
  code: z.string(),
  title: z.string(),
})

export type SubjectCreate = z.infer<typeof SubjectCreateSchema>

export const SubjectUpdateSchema = SubjectCreateSchema.partial()

export type SubjectUpdate = z.infer<typeof SubjectUpdateSchema>

export const SubjectReadSchema = z.object({
  id: z.string(),
})

export type SubjectRead = z.infer<typeof SubjectReadSchema>

export const SubjectDeleteSchema = z.object({
  id: z.string(),
})

export type SubjectDelete = z.infer<typeof SubjectDeleteSchema>

/**
 *
 * Program
 *
 */

export const ProgramCreateSchema = z.object({
  pid: z.string(),
  coursedog_id: z.string(),
  program_group_id: z.string(),
  code: z.string(),
  name: z.string(),
  long_name: z.string(),
  display_name: z.string(),
  type: z.string(),
  degree_designation_code: z.string().nullish().optional(),
  degree_designation_name: z.string().nullish().optional(),
  career: enums.CareerEnum,
  admission_info: z.string().nullish().optional(),
  general_info: z.string().nullish().optional(),
  transcript_level: z.number().nullish().optional(),
  transcript_description: z.string().nullish().optional(),
  requisites: utils.JsonSchema.optional(),
  is_active: z.boolean(),
  start_term: utils.JsonSchema.optional(),
  program_created_at: z.coerce.date(),
  program_last_updated_at: z.coerce.date(),
  program_effective_start_date: z.coerce.date(),
  version: z.number(),
})

export type ProgramCreate = z.infer<typeof ProgramCreateSchema>

export const ProgramUpdateSchema = ProgramCreateSchema.partial()

export type ProgramUpdate = z.infer<typeof ProgramUpdateSchema>

export const ProgramReadSchema = z.object({
  id: z.string(),
})

export type ProgramRead = z.infer<typeof ProgramReadSchema>

export const ProgramDeleteSchema = z.object({
  id: z.string(),
})

export type ProgramDelete = z.infer<typeof ProgramDeleteSchema>

/**
 *
 * Account
 *
 */

export const AccountCreateSchema = z.object({
  email: z.string(),
  name: z.string().nullish().optional(),
  password: z.string(),
  is_admin: z.boolean(),
})

export type AccountCreate = z.infer<typeof AccountCreateSchema>

export const AccountUpdateSchema = AccountCreateSchema.partial()

export type AccountUpdate = z.infer<typeof AccountUpdateSchema>

export const AccountReadSchema = z.object({
  id: z.string(),
})

export type AccountRead = z.infer<typeof AccountReadSchema>

export const AccountDeleteSchema = z.object({
  id: z.string(),
})

export type AccountDelete = z.infer<typeof AccountDeleteSchema>
