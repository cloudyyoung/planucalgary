import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>
export type RequisiteRuleListOutput = RouterOutput["requisite_rules"]["list"]
export type RequisiteRuleListItem = RequisiteRuleListOutput["items"][number]

export const useRequisiteRules = (props: RouterInput["requisite_rules"]["list"]) => {
  const result = useQuery({
    queryKey: ["requisite-rules", props],
    queryFn: async () => trpcClient.requisite_rules.list.query(props),
    placeholderData: keepPreviousData,
  });

  return result;
};
