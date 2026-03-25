import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type RequisiteSetListInput = RouterInput["requisite_sets"]["list"]
export type RequisiteSetListOutput = RouterOutput["requisite_sets"]["list"]
export type RequisiteSetListItem = RequisiteSetListOutput["items"][number]

export const useRequisiteSets = (props: RequisiteSetListInput) => {
  const result = useQuery<RequisiteSetListOutput>({
    queryKey: ["requisite-sets", props],
    queryFn: async () => trpcClient.requisite_sets.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
