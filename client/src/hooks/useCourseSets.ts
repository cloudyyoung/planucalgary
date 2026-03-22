import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>
type CourseSetListOutput = RouterOutput["courseSets"]["list"]

export const useCourseSets = (props: RouterInput["courseSets"]["list"]) => {
  const result = useQuery<CourseSetListOutput>({
    queryKey: ["course-sets", props],
    queryFn: async () => trpcClient.courseSets.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
