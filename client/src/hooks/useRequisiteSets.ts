import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
export type RequisiteSetListOutput = RouterOutput["requisite_sets"]["list"]
export type RequisiteSetListItem = RequisiteSetListOutput["items"][number]

export const useRequisiteSets = (props: RouterInput["requisite_sets"]["list"]) => {
    const result = useQuery({
        queryKey: ["requisite-sets", props],
        queryFn: async () => trpcClient.requisite_sets.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
