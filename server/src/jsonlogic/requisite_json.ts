import { RequisiteJsonValidation, RequisiteJsonValidationMessage } from "@planucalgary/shared"
import { prismaClient } from "../middlewares"
import { bool } from "./utils"

export type CourseCode = string
export type DynamicCourse = {
  field?: FieldString
  level?: LevelString
  subject?: SubjectCode
  faculty?: FacultyCode
  department?: DepartmentCode
}
export type FacultyCode = string
export type DepartmentCode = string
export type ProgramString = string
export type YearString = "first" | "second" | "third" | "fourth" | "fifth"
export type SubjectCode = string
export type FieldString = string
export type LevelString = string

export type Operators = CourseCode | DynamicCourse | Units | And | Or | Not | Consent | Admission | Year
export type Units = {
  units: number
  from?: (CourseCode | DynamicCourse)[]
  not?: (CourseCode | DynamicCourse)[]
}
export type And = {
  and: Operators[]
}
export type Or = {
  or: Operators[]
}
export type Not = {
  not: Operators
}
export type Consent = {
  consent: Faculty | Department
}
export type Admission = {
  admission: Faculty | Department | Program
}
export type Year = {
  year: YearString
}
export type Faculty = {
  faculty: FacultyCode
}
export type Department = {
  department: DepartmentCode
}
export type Program = {
  program: ProgramString
}

export interface ValidateOptions {
  safe?: boolean
  strict?: boolean
}

export const getValidator = async () => {
  const subjects = await prismaClient.subject.findMany()
  const subjectCodes = subjects.map((subject) => subject.code)
  const faculties = await prismaClient.faculty.findMany()
  const facultyCodes = faculties.map((faculty) => faculty.code)
  const departments = await prismaClient.department.findMany()
  const departmentCodes = departments.map((department) => department.code)
  const courses = await prismaClient.course.findMany({
    select: {
      code: true,
      topics: {
        select: {
          number: true,
        },
      },
    },
    distinct: ["code"],
  })
  const courseCodes = courses.flatMap((course) => {
    const topics = course.topics.map((topic) => `${course.code}.${topic.number.padStart(2, "0")}`)
    return [course.code, ...topics]
  })

  const validator = (json: any, options?: ValidateOptions): RequisiteJsonValidation => {
    options = options !== undefined ? options : {}
    options.safe = options.safe !== undefined ? options.safe : true
    options.strict = options.strict !== undefined ? options.strict : false

    const is_object = (obj: object, key: string | string[]): boolean => {
      if (typeof obj !== "object") {
        return false
      }
      const keys = Array.isArray(key) ? key : [key]
      return Object.keys(obj).every((k) => keys.includes(k))
    }

    // Validators for primitive types, like strings, numbers, etc.
    const primitive_validators: Record<string, (obj: any) => boolean> = {
      course_code: (obj: object | string) => {
        if (typeof obj !== "string") {
          errors.push({ message: "Course code must be a string", value: obj })
          return false
        }

        // If given an untracked course name, eg., "Applied Mathematics 211",
        // it is required that database doesn't track such course, ie., "AMAT211" should not exist in the database.
        const UntrackedCourseRegex = /^([A-Za-z ,']+) ([0-9]{2,3}(-[0-9])?(.[0-9]{2})?[AB]?)$/
        const isUntrackedString = UntrackedCourseRegex.test(obj)
        if (isUntrackedString) {
          const matches = obj.match(UntrackedCourseRegex)!
          const subject = matches[1]
          const courseNumber = matches[2]
          const subjectCode = subjects.find((s) => s.title === subject)

          if (subjectCode) {
            const courseCode = `${subjectCode}${courseNumber}`
            const valid = courseCodes.includes(courseCode)
            if (!valid) {
              errors.push({ message: "Course code should be given but got course full name", value: obj })
              return false
            }
          }

          warnings.push({ message: "Course is untracked in the catalog", value: obj })
          return true
        }

        // If given a tracked course code, eg., "AMAT211", it is required that subject code "AMAT" exists in the database.
        // If subject code "AMAT" doesn't exist in the database, "AMAT" is not at all a valid course code.
        const TrackedCourseRegex = /^([A-Z]{3,4})[0-9]{2,3}(-[0-9])?(.[0-9]{2})?[AB]?$/
        const isTrackedString = TrackedCourseRegex.test(obj)
        if (isTrackedString) {
          const matches = obj.match(TrackedCourseRegex)!
          const subjectCode = matches[1]
          const valid = subjectCodes.includes(subjectCode)
          if (!valid) {
            errors.push({ message: "Course code does not exist", value: obj })
            return false
          }
        }

        const isTrackedCourseCode = courseCodes.includes(obj)
        if (!isUntrackedString && !isTrackedString && !isTrackedCourseCode) {
          errors.push({ message: "Course code does not exist", value: obj })
          return false
        }

        // In loose mode, we allow untrack course code like "MATH123" to be valid. Because "MATH" is a valid subject
        // code in the database, although "MATH123" might not exist in the database.
        // In strict mode, we require that the course code is a valid course code in the database. "MATH123" is not valid in strict mode.
        if (!isTrackedCourseCode) {
          if (options.strict) {
            errors.push({ message: "Course code does not exist", value: obj })
            return false
          } else {
            warnings.push({ message: "Course is untracked in the catalog", value: obj })
          }
        }

        return true
      },
      dynamic_course: (obj: object | string) => {
        if (typeof obj !== "object") {
          errors.push({ message: "Dynamic course must be an object", value: obj })
          return false
        }

        const valid_fields = ["field", "level", "subject", "faculty", "department"]
        const keys = Object.keys(obj)
        const valid = keys.every((key) => valid_fields.includes(key))
        if (!valid) {
          errors.push({ message: "Dynamic course object has invalid properties", value: obj })
          return false
        }

        const dynamic = obj as DynamicCourse

        const field = dynamic.field
        if (field && typeof field !== "string") {
          errors.push({ message: "Property 'field' must be a string", value: obj })
          return false
        }

        const level = dynamic.level
        if (level) {
          if (typeof level !== "string") {
            errors.push({ message: "Property 'level' must be a string", value: obj })
            return false
          } else if (!primitive_validators.level_string(level)) {
            errors.push({ message: "Property 'level' must be a valid level", value: obj })
            return false
          }
        }

        const subject = dynamic.subject
        if (subject && !primitive_validators.subject_code(subject)) {
          errors.push({ message: "Property 'subject' must be a valid course code", value: obj })
          return false
        }

        const faculty = dynamic.faculty
        if (faculty && !primitive_validators.faculty_code(faculty)) {
          errors.push({ message: "Property 'faculty' must be a valid faculty code", value: obj })
          return false
        }

        const department = dynamic.department
        if (department && !primitive_validators.department_code(department)) {
          errors.push({ message: "Property 'department' must be a valid department code", value: obj })
          return false
        }

        return true
      },
      level_string: (obj: object | string) => {
        if (typeof obj !== "string") {
          errors.push({ message: "Level must be a string", value: obj })
          return false
        }

        const regex = /[0-9]{2,3}[+]?/
        const valid = regex.test(obj)
        if (!valid) {
          errors.push({ message: "Level is not in a valid format", value: obj })
          return false
        }

        return true
      },
      subject_code: (obj: object | string) => {
        if (typeof obj !== "string") {
          errors.push({ message: "Subject code must be a string", value: obj })
          return false
        }

        // In loose mode, we allow untrack subject code like "Women's Studies" to be valid.
        // Because "Women's Studies" is a valid subject code, although "Mathematics" might not exist in the database.
        if (!options.strict) {
          const UntrackSubjectRegex = /^[A-Za-z ,']{5,}$/
          if (UntrackSubjectRegex.test(obj)) {
            const valid = subjects.some((subject) => subject.title === obj)
            if (valid) {
              errors.push({ message: "Subject code should be given but got subject full name", value: obj })
              return false
            }

            warnings.push({ message: "Subject is untracked", value: obj })
            return true
          }
        }

        const valid = subjectCodes.includes(obj)
        if (!valid) {
          errors.push({ message: "Subject code does not exist", value: obj })
          return false
        }

        return true
      },
      faculty_code: (obj: object | string) => {
        if (typeof obj !== "string") {
          errors.push({ message: "Faculty code must be a string", value: obj })
          return false
        }

        const valid = facultyCodes.includes(obj)
        if (!valid) {
          errors.push({ message: "Faculty code does not exist", value: obj })
          return false
        }

        return true
      },
      department_code: (obj: object | string) => {
        if (typeof obj !== "string") {
          errors.push({ message: "Department code must be a string", value: obj })
          return false
        }

        const valid = departmentCodes.includes(obj)
        if (!valid) {
          errors.push({ message: "Department code does not exist", value: obj })
          return false
        }

        return true
      },
      program_string: (obj: object | string) => {
        if (typeof obj !== "string") {
          errors.push({ message: "Program must be a string", value: obj })
          return false
        }

        return true
      },
      year_string: (obj: object | string) => {
        if (typeof obj !== "string") {
          errors.push({ message: "Year must be a string", value: obj })
          return false
        }

        const options = ["first", "second", "third", "fourth", "fifth"]
        if (!options.includes(obj)) {
          errors.push({ message: "Invalid year", value: obj })
          return false
        }

        return true
      },
    }

    // Validators for logic operators, like "and", "or", "not", etc.
    // These validators first checks if an object is indeed the specified operator,
    // then checks if the operator has the correct properties.
    // Course codes and dynamic courses themselves also serve as logic operators (eg., truthy if the course is taken).
    const operator_validators: Record<string, (obj: any, ...args: any[]) => boolean> = {
      course: (obj: CourseCode) => {
        if (typeof obj !== "string") {
          return false
        }

        return primitive_validators.course_code(obj)
      },
      dynamic_course: (obj: DynamicCourse) => {
        if (typeof obj !== "object") {
          return false
        }

        if (!is_object(obj, ["field", "level", "subject", "faculty", "department"])) {
          return false
        }

        return primitive_validators.dynamic_course(obj)
      },
      and: (obj: And, courseOnly: boolean = false) => {
        if (!is_object(obj, "and")) {
          return false
        }

        const and_arguments = obj.and

        if (!Array.isArray(and_arguments)) {
          errors.push({ message: '"and" operator requires an array of arguments', value: obj })
          return false
        } else if (and_arguments.length < 2) {
          errors.push({
            message: `"and" operator requires at least 2 arguments, got ${and_arguments.length}`,
            value: obj,
          })
          return false
        }

        if (courseOnly) {
          const results = and_arguments.map(
            (c) => operator_validators.course(c) || operator_validators.dynamic_course(c),
          )
          return results.every(bool)
        }

        const results = and_arguments.map(generic_validate)
        return results.every(bool)
      },
      or: (obj: Or, courseOnly: boolean = false) => {
        if (!is_object(obj, "or")) {
          return false
        }

        const or_arguments = obj.or

        if (!Array.isArray(or_arguments)) {
          errors.push({ message: '"or" operator requires an array of arguments', value: obj })
          return false
        } else if (or_arguments.length < 2) {
          errors.push({
            message: `"or" operator requires at least 2 arguments, got ${or_arguments.length}`,
            value: obj,
          })
          return false
        }

        if (courseOnly) {
          const results = or_arguments.map(
            (c) => operator_validators.course(c) || operator_validators.dynamic_course(c),
          )
          return results.every(bool)
        }

        const results = or_arguments.map(generic_validate)
        return results.some(bool)
      },
      not: (obj: Not) => {
        if (!is_object(obj, "not")) {
          return false
        }

        const not_argument = obj.not

        if (typeof not_argument !== "object" && typeof not_argument !== "string") {
          errors.push({ message: '"not" operator requires a single argument', value: obj })
          return false
        }

        return generic_validate(not_argument)
      },
      units: (obj: Units) => {
        if (!is_object(obj, ["units", "from", "not"])) {
          return false
        }

        const units = obj.units
        if (typeof units !== "number") {
          errors.push({ message: "Property 'units' must be a number", value: obj })
          return false
        } else if (!Number.isInteger(units)) {
          errors.push({ message: "Property 'units' must be an integer", value: obj })
          return false
        }

        const from = obj.from
        if (from) {
          if (!Array.isArray(from)) {
            errors.push({ message: "Property 'from' must be an array", value: obj })
            return false
          }

          const results = from.map(
            (c) =>
              operator_validators.course(c) ||
              operator_validators.dynamic_course(c) ||
              operator_validators.and(c, true) ||
              operator_validators.or(c, true),
          )
          if (!results.every(bool)) {
            errors.push({ message: "Property 'from' must be an array of courses, got alien element(s)", value: obj })
            return false
          }
        }

        const not = obj.not
        if (not) {
          if (!Array.isArray(not)) {
            errors.push({ message: "Property 'not' must be an array", value: obj })
            return false
          }

          const results = not.map(
            (c) =>
              operator_validators.course(c) ||
              operator_validators.dynamic_course(c) ||
              operator_validators.and(c, true) ||
              operator_validators.or(c, true),
          )
          if (!results.every(bool)) {
            errors.push({ message: "Property 'not' must be an array of courses, got alien element(s)", value: obj })
            return false
          }
        }

        return true
      },
      consent: (obj: Consent) => {
        if (!is_object(obj, "consent")) {
          return false
        }

        const consent = obj.consent
        if (typeof consent !== "object") {
          errors.push({ message: "Property 'consent' must be an object", value: obj })
          return false
        }

        const validObjects = [object_validators.faculty, object_validators.department]
        const object_validators_fns = Object.values(validObjects)
        const oneOf = object_validators_fns.some((validator) => validator(consent))

        if (!oneOf) {
          errors.push({ message: "Property 'consent' must be a valid faculty or department object", value: obj })
          return false
        }

        return true
      },
      admission: (obj: Admission) => {
        if (!is_object(obj, "admission")) {
          return false
        }

        const admission = obj.admission
        if (typeof admission !== "object") {
          errors.push({ message: "Property 'admission' must be an object", value: obj })
          return false
        }

        const validObjects = [object_validators.faculty, object_validators.department, object_validators.program]
        const object_validators_fns = Object.values(validObjects)
        const oneOf = object_validators_fns.some((validator) => validator(admission))

        if (!oneOf) {
          errors.push({
            message: "Property 'admission' must be a valid faculty, department, or program object",
            value: obj,
          })
          return false
        }

        return true
      },
      year: (obj: Year) => {
        if (!is_object(obj, "year")) {
          return false
        }

        const year = obj.year
        if (typeof year !== "string") {
          errors.push({ message: "Property 'year' must be a string", value: obj })
          return false
        }

        if (!primitive_validators.year_string(year)) {
          errors.push({ message: "Property 'year' must be a valid year", value: obj })
          return false
        }

        return true
      },
    }

    // Validators for objects, like faculty, department, program, etc.
    // These objects don't exist alone in the JSON, but are properties of other objects.
    // These validators check if the object has the correct properties.
    const object_validators: Record<string, (obj: any) => boolean> = {
      faculty: (obj: Faculty) => {
        if (!is_object(obj, "faculty")) {
          return false
        }

        const faculty_code = obj.faculty
        if (!primitive_validators.faculty_code(faculty_code)) {
          errors.push({ message: "Faculty code must be a valid faculty code", value: obj })
          return false
        }

        return true
      },
      department: (obj: Department) => {
        if (!is_object(obj, "department")) {
          return false
        }

        const department_code = obj.department
        if (!primitive_validators.department_code(department_code)) {
          errors.push({ message: "Department code must be a valid department code", value: obj })
          return false
        }

        return true
      },
      program: (obj: Program) => {
        if (!is_object(obj, "program")) {
          return false
        }

        const program_string = obj.program
        if (!primitive_validators.program_string(program_string)) {
          errors.push({ message: "Program must be a valid program string", value: obj })
          return false
        }

        return true
      },
    }

    const generic_validate = (obj: any): boolean => {
      if (obj === null || obj === undefined) {
        errors.push({ message: "Requisite JSON cannot be null or undefined", value: obj })
        return false
      }

      if (typeof obj !== "string" && typeof obj !== "object") {
        errors.push({ message: "Requisite JSON must be an object or a string", value: obj })
        return false
      }

      const validatorFns = Object.values(operator_validators)
      const oneOf = validatorFns.some((validator) => validator(obj))

      if (!oneOf && errors.length === 0) {
        errors.push({ message: "Unknown requiste body", value: obj })
      }

      return oneOf
    }

    const errors: RequisiteJsonValidationMessage[] = []
    const warnings: RequisiteJsonValidationMessage[] = []
    const valid = generic_validate(json)

    if (options.safe === false && errors.length > 0) {
      throw new RequisiteJsonError(errors)
    }

    return {
      json_valid: valid,
      json_errors: errors,
      json_warnings: warnings,
    }
  }

  return validator
}

export class RequisiteJsonError extends Error {
  errors: RequisiteJsonValidationMessage[]

  constructor(errors: RequisiteJsonValidationMessage[]) {
    const message =
      "Invalid JSON\n" + errors.map((error) => `- ${error.message}\n    ${JSON.stringify(error.value)}`).join("\n")
    super(message)
    this.name = "RequisiteJsonError"
    this.errors = errors
  }
}
