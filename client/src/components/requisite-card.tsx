import { RequisiteRule } from "@prisma/browser"
import { RequisiteRuleCard } from "./requisite-rule-card"

export const RequisiteCard = ({ rules }: { rules?: RequisiteRule[] }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {rules?.map(rule => (
        <RequisiteRuleCard rule={rule} />
      ))}
    </div>
  )
}

