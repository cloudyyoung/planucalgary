import { Prisma, Requisite } from "@prisma/browser"
import { RequisiteRuleCard } from "./requisite-rule-card"

type RequisiteWithRules = Prisma.RequisiteGetPayload<{
  include: { rules: true }
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

