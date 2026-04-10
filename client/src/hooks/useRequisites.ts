import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type RequisiteListInput = RouterInput["requisites"]["list"]
export type RequisiteListOutput = RouterOutput["requisites"]["list"]
export type RequisiteListItem = RequisiteListOutput["items"][number]

export const useRequisites = (props: RequisiteListInput) => {
  const result = useQuery<RequisiteListOutput>({
    queryKey: ["requisites", props],
    queryFn: async () => trpcClient.requisites.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
