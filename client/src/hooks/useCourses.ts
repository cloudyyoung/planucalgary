import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CourseListReqQuery } from "@contracts"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterOutput = inferRouterOutputs<AppRouter>
export type CourseListOutput = RouterOutput["courses"]["list"]
export type CourseListItem = CourseListOutput["items"][number]

export const useCourses = (props: CourseListReqQuery) => {
  const result = useQuery<CourseListOutput>({
    queryKey: ["courses", props],
    queryFn: async () => trpcClient.courses.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
