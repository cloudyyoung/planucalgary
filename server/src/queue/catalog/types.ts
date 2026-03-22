export type RequisiteRuleValueNode =
  | string
  | {
      logic?: string
      value?: string[]
    }

export type RequisiteRuleValue = {
  values: RequisiteRuleValueNode[]
}

export type RequisiteRuleData = {
  id: string
  name: string
  description?: string | null
  notes?: string | null
  condition: string
  minCourses?: number | null
  maxCourses?: number | null
  minCredits?: number | null
  maxCredits?: number | null
  credits?: number | null
  number?: number | null
  restriction?: number | null
  grade?: string | null
  gradeType?: string | null
  value?: unknown
}

export type RequisiteData = {
  id: string
  name: string
  type: string
  rules: RequisiteRuleData[]
}

export type RequisiteSetData = {
  _id: string
  requisiteSetGroupId: string
  version: number
  name: string
  description?: string | null
  requisites?: RequisiteData[]
  createdAt?: string | number
  lastEditedAt?: string | number
  effectiveStartDate?: string | null
  effectiveEndDate?: string | null
}
