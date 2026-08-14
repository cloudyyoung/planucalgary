import { Prisma } from "@prisma/browser"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Badge } from "@/components/ui/badge"
import { Pill } from "@/components/ui/pill"
import { CourseSetCard } from "@/components/course-set-card"
import _ from "lodash"

type BaseRequisiteRule = Prisma.RequisiteRuleGetPayload<{
  include: {
    referring_courses: true;
    referring_programs: true;
    referring_course_sets: true;
    referring_requisite_sets: true;
  };
}>;

export type RequisiteRuleWithRelations = BaseRequisiteRule & {
  sub_rules: RequisiteRuleWithRelations[];
};

export interface RequisiteRuleCardProps {
  rule: RequisiteRuleWithRelations
}

export const RequisiteRuleCard = (props: RequisiteRuleCardProps) => {
  const rule = props.rule
  const condition = rule.condition
  const hasName = !_.isEmpty(rule.name)

  let value = null
  let referringCourses = null
  let referringPrograms = null
  let referringCourseSets = null
  let referringRequisiteSets = null
  let sub_rules = null

  if (condition === "completeVariableCoursesAndVariableCredits") {
    const range_courses = [rule.min_courses, rule.max_courses]
    const range_credits = [rule.min_credits, rule.max_credits]
    const value_courses = range_courses.filter(v => v !== null).join(" - ")
    const value_credits = range_credits.filter(v => v !== null).join(" - ")
    value = `${value_courses} courses, ${value_credits} credits`
  } else if (condition === "numberOf") {
    value = rule.number
  } else if (condition === "completedAtLeastXOf") {
    value = rule.restriction
  } else if (condition === "minimumCredits" || condition === "minimumResidencyCredits") {
    value = rule.credits
  } else if (condition === "minimumGrade" || condition === "averageGrade") {
    value = `${rule.grade} (${rule.grade_type})`
  }

  if (rule.referring_courses) {
    referringCourses = (
      <div className="flex flex-wrap gap-1 items-center">
        {rule.referring_courses.map(c => (
          <Pill key={c.id} variant="secondary">{c.code}</Pill>
        ))}
      </div>
    )
  }

  if (rule.referring_programs) {
    referringPrograms = (
      <div className="flex flex-wrap gap-1 items-center">
        {rule.referring_programs.map(p => (
          <Pill key={p.id} variant="secondary">{p.code}</Pill>
        ))}
      </div>
    )
  }

  if (rule.referring_course_sets) {
    referringCourseSets = (
      <div className="flex flex-col gap-1 justify-center">
        {rule.referring_course_sets.map(cs => (
          <CourseSetCard key={cs.id} courseSet={cs} />
        ))}
      </div>
    )
  }

  if (rule.referring_requisite_sets) {
    referringRequisiteSets = (
      <div className="flex flex-wrap gap-1 justify-center">
        {rule.referring_requisite_sets.map(rs => (
          <Pill key={rs.id} variant="secondary">{rs.name}</Pill>
        ))}
      </div>
    )
  }

  if (rule.sub_rules) {
    sub_rules = (
      <div className="flex flex-col gap-1 justify-center">
        {rule.sub_rules.map(sr => (
          <RequisiteRuleCard key={sr.id} rule={sr} />
        ))}
      </div>
    )
  }

  return (
    <Item variant="outline" size="sm" className="p-2">
      <ItemContent>
        <ItemDescription>
          <Badge variant="secondary" className="text-gray-400">Requisite rule: {rule.id}</Badge>
        </ItemDescription>
        <ItemTitle>{hasName ? rule.name : "Unnamed Rule"}</ItemTitle>
        {rule.description && <ItemDescription>{rule.description}</ItemDescription>}
        <ItemDescription>
          {condition}: {value}
        </ItemDescription>
        <ItemDescription>
          {referringCourses}
          {referringPrograms}
          {referringCourseSets}
          {referringRequisiteSets}
        </ItemDescription>
        <ItemDescription>
          {rule.notes}
        </ItemDescription>
        <ItemDescription>
          {sub_rules}
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}
