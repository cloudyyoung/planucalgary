import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<AppRouter>

export type RequisiteSetListItem = {
    id: string
    csid?: string
    requisite_set_group_id: string
    version: number
    name: string
    description: string | null
    raw_json: unknown
    created_at: string
    updated_at: string
    requisite_set_created_at: string
    requisite_set_last_updated_at: string
    requisite_set_effective_start_date: string | null
    requisite_set_effective_end_date: string | null
}

export type RequisiteSetListOutput = {
    total: number
    offset: number
    limit: number
    items: RequisiteSetListItem[]
}

export const useRequisiteSets = (props: RouterInput["requisite_sets"]["list"]) => {
    const result = useQuery({
        queryKey: ["requisite-sets", props],
        queryFn: async () => trpcClient.requisite_sets.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
