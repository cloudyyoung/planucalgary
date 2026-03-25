import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type ProgramListInput = RouterInput["programs"]["list"]
type ProgramListOutput = RouterOutput["programs"]["list"]

export const usePrograms = (props: ProgramListInput) => {
  const result = useQuery<ProgramListOutput>({
    queryKey: ["programs", props],
    queryFn: async () => trpcClient.programs.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
