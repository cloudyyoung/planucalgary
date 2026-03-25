import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type CourseSetListOutput = RouterOutput["course_sets"]["list"]

export const useCourseSets = (props: RouterInput["course_sets"]["list"]) => {
  const result = useQuery<CourseSetListOutput>({
    queryKey: ["course-sets", props],
    queryFn: async () => trpcClient.course_sets.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
