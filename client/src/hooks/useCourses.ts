import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>
export type CourseListOutput = RouterOutput["courses"]["list"]
export type CourseListItem = CourseListOutput["items"][number]

export const useCourses = (props: RouterInput["courses"]["list"]) => {
  const result = useQuery<CourseListOutput>({
    queryKey: ["courses", props],
    queryFn: async () => trpcClient.courses.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
