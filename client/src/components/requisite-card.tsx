import { Requisite } from "@prisma/browser"
import _ from "lodash"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Badge } from "@/components/ui/badge"
import { RequisiteRuleCard, RequisiteRuleWithRelations } from "@/components/requisite-rule-card"

type RequisiteWithRelations = Requisite & {
  rules: RequisiteRuleWithRelations[]
}

export const RequisiteCard = ({ requisite }: { requisite: RequisiteWithRelations }) => {
  const hasName = !_.isEmpty(requisite.name)

  return (
    <Item variant="outline" size="sm" className="p-2.5">
      <ItemContent>
        <ItemDescription>
          <Badge variant="secondary" className="text-gray-400">Requisite: {requisite.id}</Badge>
        </ItemDescription>
        <ItemTitle>{hasName ? requisite.name : "Unnamed Requisite"}</ItemTitle>
        <ItemDescription>{requisite.type}</ItemDescription>
        <ItemDescription>{requisite.notes}</ItemDescription>
        {requisite.rules.map(rule => (
          <RequisiteRuleCard key={rule.id} rule={rule} />
        ))}
      </ItemContent>
    </Item>
  )
}
