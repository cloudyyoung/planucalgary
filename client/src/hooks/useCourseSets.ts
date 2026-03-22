import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CourseSetListReqQuery } from "@contracts"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterOutput = inferRouterOutputs<AppRouter>
type CourseSetListOutput = RouterOutput["courseSets"]["list"]

export const useCourseSets = (props: CourseSetListReqQuery) => {
  const result = useQuery<CourseSetListOutput>({
    queryKey: ["course-sets", props],
    queryFn: async () => trpcClient.courseSets.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
