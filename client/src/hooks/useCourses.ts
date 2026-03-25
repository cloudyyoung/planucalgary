import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type CourseListInput = RouterInput["courses"]["list"]
type CourseListOutput = RouterOutput["courses"]["list"]

export type CourseListItem = CourseListOutput["items"][number]

export const useCourses = (props: CourseListInput) => {
  const result = useQuery<CourseListOutput>({
    queryKey: ["courses", props],
    queryFn: async () => trpcClient.courses.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
