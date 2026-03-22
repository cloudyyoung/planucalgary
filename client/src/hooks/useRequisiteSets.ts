import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { RequisiteSetListReqQuery } from "@contracts"
import { trpcClient } from "@/trpc"

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
    has_more: boolean
    items: RequisiteSetListItem[]
}

export const useRequisiteSets = (props: RequisiteSetListReqQuery) => {
    const result = useQuery({
        queryKey: ["requisite-sets", props],
        queryFn: async () => trpcClient.requisiteSets.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
