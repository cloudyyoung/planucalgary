import { CourseSet } from "@prisma/browser"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Badge } from "@/components/ui/badge"

export const CourseSetCard = ({ courseSet }: { courseSet: CourseSet }) => {
  return (
    <Item variant="outline" size="sm" className="p-2">
      <ItemContent>
        <ItemTitle>{courseSet.name}</ItemTitle>
        <ItemDescription></ItemDescription>
        <Badge variant="secondary" className="text-gray-400 w-20 flex justify-center items-center">{courseSet.id}</Badge>
      </ItemContent>
    </Item>
  )
}
