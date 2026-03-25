import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type FacultyListInput = RouterInput["faculties"]["list"]
type FacultyListOutput = RouterOutput["faculties"]["list"]

export const useFaculties = (props: FacultyListInput) => {
  const result = useQuery<FacultyListOutput>({
    queryKey: ["faculties", props],
    queryFn: async () => trpcClient.faculties.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
