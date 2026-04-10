import { Course, CourseSet, Program, RequisiteRule, RequisiteSet } from "@prisma/browser"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Badge } from "@/components/ui/badge"
import { Pill } from "@/components/ui/pill"
import { CourseSetCard } from "@/components/course-set-card"

export const RequisiteCard = ({ rules }: { rules?: RequisiteRule[] }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {rules?.map(rule => (
        <Item variant="outline" size="sm" key={rule.id} className="p-2">
          <ItemContent>
            <ItemTitle>
              {rule.name ?? "Unnamed Rule"}
              <Badge variant="secondary" className="text-gray-400 flex justify-center items-center">{rule.id}</Badge>
            </ItemTitle>
            {rule.description && <ItemDescription>{rule.description}</ItemDescription>}
            <ItemDescription>{getValue(rule)}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  )
}

const getValue = (rule: RequisiteRule & { referring_courses?: Course[], referring_programs?: Program[], referring_course_sets?: CourseSet[], referring_requisite_sets?: RequisiteSet[] }) => {
  const condition = rule.condition
  let value = null
  let referringCourses = null
  let referringPrograms = null
  let referringCourseSets = null
  let referringRequisiteSets = null

  if (condition === "freeformText") {
    return condition
  }

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

  if (rule.referring_courses && rule.referring_courses.length > 0) {
    referringCourses = <div className="flex flex-row gap-1 items-center">
      {rule.referring_courses.map(c => (
        <Pill key={c.id} variant="secondary">{c.code}</Pill>
      ))}
    </div>
  }

  if (rule.referring_programs && rule.referring_programs.length > 0) {
    referringPrograms = <div className="flex flex-row gap-1 items-center">
      {rule.referring_programs.map(p => (
        <Pill key={p.id} variant="secondary">{p.code}</Pill>
      ))}
    </div>
  }

  if (rule.referring_course_sets && rule.referring_course_sets.length > 0) {
    referringCourseSets = <div className="flex flex-col gap-1 justify-center">
      {rule.referring_course_sets.map(cs => (
        <CourseSetCard key={cs.id} courseSet={cs} />
      ))}
    </div>
  }

  if (rule.referring_requisite_sets && rule.referring_requisite_sets.length > 0) {
    referringRequisiteSets = <div className="flex flex-col gap-1 justify-center">
      {rule.referring_requisite_sets.map(rs => (
        <Pill key={rs.id} variant="secondary">{rs.name}</Pill>
      ))}
    </div>
  }

  return <div className="flex flex-col gap-1">
    {condition}: {value}
    {referringCourses}
    {referringPrograms}
    {referringCourseSets}
    {referringRequisiteSets}
  </div>
}
