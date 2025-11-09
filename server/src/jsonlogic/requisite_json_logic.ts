import { Course } from "@prisma/client"
import { sum } from "lodash"
import { prismaClient } from "../middlewares"

export type Operator<T> = {
  name: string
  precedence?: number
  is_rule: (logic: any) => logic is T
  apply:  (logic: T, data: Data) => any
}

export type Operators = Record<string, Operator<any>>

export type Data = {
  courses: Course[]
}

export type References = {
  subjectCodes: string[],
  facultyCodes: string[],
  departmentCodes: string[],
  courseCodes: string[],
}

export const RequisiteJsonLogic = {
  operators: {} as Operators,
  references: {} as References,
  add_operator<T>(operator: Operator<T>) {
    RequisiteJsonLogic.operators[operator.name] = operator
    const sortedOperators = Object.values(RequisiteJsonLogic.operators).sort((a, b) => {
      return (b.precedence || 10) - (a.precedence || 10)
    })
    RequisiteJsonLogic.operators = Object.fromEntries(sortedOperators.map(op => [op.name, op]))
  },
  get_operator: (name: string) => {
    return RequisiteJsonLogic.operators[name]
  },
  populate_data: async () => {
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

    RequisiteJsonLogic.references = {
      subjectCodes,
      facultyCodes,
      departmentCodes,
      courseCodes,
    }
  },
  is_rule: (logic: object | string) => Object.values(RequisiteJsonLogic.operators).some(op => op.is_rule(logic)),
  is_satisfied: (logic: object | string, data: Data) => {
    return !!Object.values(RequisiteJsonLogic.operators).find(op => op.is_rule(logic))?.apply(logic, data)
  },
}

export type RequisiteLogicAnd = {
  and: (string | object)[]
}

RequisiteJsonLogic.add_operator({
  name: 'and',
  is_rule: (logic: any): logic is RequisiteLogicAnd => logic && typeof logic === 'object' && Object.keys(logic).includes('and') && Array.isArray(logic.and) && logic.and.every((arg: any) => RequisiteJsonLogic.is_rule(arg)),
  apply: (logic: RequisiteLogicAnd, data: any) => logic.and.every((arg: any) => RequisiteJsonLogic.is_satisfied(arg, data)),
})

export type RequisiteLogicOr = {
  or: (string | object)[]
}

RequisiteJsonLogic.add_operator({
  name: 'or',
  is_rule: (logic: any): logic is RequisiteLogicOr => logic && typeof logic === 'object' && Object.keys(logic).includes('or') && Array.isArray(logic.or) && logic.or.every((arg: any) => RequisiteJsonLogic.is_rule(arg)),
  apply: (logic: RequisiteLogicOr, data: any) => logic.or.some((arg: any) => RequisiteJsonLogic.is_satisfied(arg, data)),
})

export type RequisiteLogicNot = {
  not: (string | object)[]
}

RequisiteJsonLogic.add_operator({
  name: 'not',
  is_rule: (logic: any): logic is RequisiteLogicNot => logic && typeof logic === 'object' && Object.keys(logic).includes('not') && RequisiteJsonLogic.is_rule(logic.not),
  apply: (logic: RequisiteLogicNot, data: any) => !RequisiteJsonLogic.is_satisfied(logic.not, data),
})

export type RequisiteLogicCourseCode = string

RequisiteJsonLogic.add_operator({
  name: 'course_code',
  is_rule: (logic: any): logic is RequisiteLogicCourseCode => logic && typeof logic === 'string' && RequisiteJsonLogic.references.courseCodes.includes(logic),
  apply: (logic: RequisiteLogicCourseCode, data: Data) => data.courses.find(c => c.code === logic),
})

export type RequisiteLogicUnits = {
  units: number
  from?: string[]
  not?: string[]
}

RequisiteJsonLogic.add_operator({
  name: 'units',
  is_rule: (logic: any): logic is RequisiteLogicUnits => {
    if (!(logic && typeof logic === 'object')) return false

    if (Object.keys(logic).includes('from')) {
      if (
        !Array.isArray(logic.from)
        || logic.from.length === 0
        || !logic.from.every((item: any) => RequisiteJsonLogic.is_rule(item))
      ) return false
    }

    if (Object.keys(logic).includes('not')) {
      if (
        !Array.isArray(logic.not)
        || logic.not.length === 0
        || !logic.not.every((item: any) => RequisiteJsonLogic.is_rule(item))
      ) return false
    }

    return Object.keys(logic).includes('units') && typeof logic.units === 'number' 
  },
  apply: (logic: RequisiteLogicUnits, data: Data) => {
    const units: number = logic.units
    const from: string[] = logic.from || []
    const not: string[] = logic.not || []

    const satisfiedCourses: Course[] = []
    if (from.length > 0) {
      from.forEach(courseCode => {
        const course = data.courses.find(c => c.code === courseCode)
        if (course && !not.includes(course.code)) {
          satisfiedCourses.push(course)
        }
      })
    } else {
      data.courses.forEach(course => {
        if (!not.includes(course.code)) {
          satisfiedCourses.push(course)
        }
      })
    }

    const satisfiedUnits = sum(satisfiedCourses.map(course => course.units))

    return satisfiedUnits >= units
  },
})

export type RequisiteLogicAdmission = string

RequisiteJsonLogic.add_operator({
  name: 'admission',
  is_rule: (logic: any): logic is RequisiteLogicAdmission => logic && typeof logic === 'object' && Object.keys(logic).includes('admission') && typeof logic.admission === 'string',
  apply: () => true,
})

export type RequisiteLogicConsent = string

RequisiteJsonLogic.add_operator({
  name: 'consent',
  is_rule: (logic: any): logic is RequisiteLogicConsent => logic && typeof logic === 'object' && Object.keys(logic).includes('consent') && typeof logic.consent === 'string',
  apply: () => true,
})

