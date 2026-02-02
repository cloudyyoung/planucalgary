import { Requisite, RequisiteRule } from "@planucalgary/shared/prisma/client"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Boxes } from "lucide-react"

export const RequisiteViewer = ({ requisite }: { requisite?: Requisite & { rules?: RequisiteRule[] } }) => {
  if (!requisite) {
    return <div></div>
  }

  return (
    <div>
      <div className="flex flex-col gap-2 w-full">
        {requisite.rules?.map(rule => (
          <Item variant="outline" size="sm" key={rule.id}>
            <ItemMedia variant="icon">
              <Boxes />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{rule.name}</ItemTitle>
              <ItemDescription>{rule.description}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </div>
    </div>
  )
}
