import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type CourseSetListInput = RouterInput["course_sets"]["list"]
type CourseSetListOutput = RouterOutput["course_sets"]["list"]

export const useCourseSets = (props: CourseSetListInput) => {
  const result = useQuery<CourseSetListOutput>({
    queryKey: ["course-sets", props],
    queryFn: async () => trpcClient.course_sets.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
