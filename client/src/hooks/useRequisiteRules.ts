import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RequisiteRuleListReqQuery } from "@contracts";
import { trpcClient } from "@/trpc";

type ReferringCourse = {
  course_id: string
  code: string
}

type ReferringProgram = {
  program_id: string
}

type ReferringCourseSet = {
  course_id: string
}

type ReferringRequisiteSet = {
  course_id: string
}

export type RequisiteRuleListItem = {
  id: string
  requisite_id: string
  parent_rule_id: string | null
  name: string
  description: string | null
  notes: string | null
  condition: string
  min_courses: number | null
  max_courses: number | null
  min_credits: number | null
  max_credits: number | null
  credits: number | null
  number: number | null
  restriction: number | null
  grade: string | null
  grade_type: string | null
  raw_json: unknown
  updated_at: string
  created_at: string
  referring_courses: ReferringCourse[]
  referring_programs: ReferringProgram[]
  referring_course_sets: ReferringCourseSet[]
  referring_requisite_sets: ReferringRequisiteSet[]
}

export type RequisiteRuleListOutput = {
  total: number
  offset: number
  limit: number
  has_more: boolean
  items: RequisiteRuleListItem[]
}

export const useRequisiteRules = (props: RequisiteRuleListReqQuery) => {
  const result = useQuery({
    queryKey: ["requisite-rules", props],
    queryFn: async () => trpcClient.requisiteRules.list.query(props),
    placeholderData: keepPreviousData,
  });

  return result;
};
