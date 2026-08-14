import { Prisma } from "@prisma/browser"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { RequisiteRuleCard } from "@/components/requisite-rule-card"

type RequisiteWithRules = Prisma.RequisiteGetPayload<{
  include: {
    rules: {
      include: {
        referring_courses: true
        referring_programs: true
        referring_course_sets: true
        referring_requisite_sets: true
      }
    }
  }
}>

export const RequisiteCard = ({ requisite }: { requisite: RequisiteWithRules }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {requisite.name}
      {requisite.rules.map(rule => (
        <RequisiteRuleCard rule={rule} />
      ))}
    </div>
  )
}

