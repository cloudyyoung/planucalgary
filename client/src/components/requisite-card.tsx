import { Prisma, Requisite } from "@prisma/browser"
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
  return (
    <Item variant="outline" size="sm" className="p-2.5">
      <ItemContent>
        <ItemDescription>
          <Badge variant="secondary" className="text-gray-400">Requisite: {requisite.id}</Badge>
        </ItemDescription>
        <ItemTitle>{requisite.name}</ItemTitle>
        <ItemDescription>{requisite.type}</ItemDescription>
        <ItemDescription>{requisite.notes}</ItemDescription>
        {requisite.rules.map(rule => (
          <RequisiteRuleCard key={rule.id} rule={rule} />
        ))}
      </ItemContent>
    </Item>
  )
}
