import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type RequisiteRuleListInput = RouterInput["requisite_rules"]["list"]
export type RequisiteRuleListOutput = RouterOutput["requisite_rules"]["list"]
export type RequisiteRuleListItem = RequisiteRuleListOutput["items"][number]

export const useRequisiteRules = (props: RequisiteRuleListInput) => {
  const result = useQuery<RequisiteRuleListOutput>({
    queryKey: ["requisite-rules", props],
    queryFn: async () => trpcClient.requisite_rules.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
