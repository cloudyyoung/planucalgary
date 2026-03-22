import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CourseListReqQuery } from "@planucalgary/shared"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpc } from "@/trpc"

type RouterOutput = inferRouterOutputs<AppRouter>
export type CourseListOutput = RouterOutput["courses"]["list"]
export type CourseListItem = CourseListOutput["items"][number]

export const useCourses = (props: CourseListReqQuery) => {
  const result = useQuery({
    ...trpc.courses.list.queryOptions(props),
    placeholderData: keepPreviousData,
  })

  return result
}
