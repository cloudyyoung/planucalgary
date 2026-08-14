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
        <ItemDescription>
          <Badge variant="secondary" className="text-gray-400">Course set: {courseSet.id}</Badge>
        </ItemDescription>
        <ItemTitle>
          {courseSet.name}
        </ItemTitle>
      </ItemContent>
    </Item>
  )
}
