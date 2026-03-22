import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { SubjectListReqQuery } from "@contracts"
import { trpcClient } from "@/trpc"

export type SubjectListItem = {
    id: string
    code: string
    title: string
    created_at: string
    updated_at: string
}

export type SubjectListOutput = {
    total: number
    offset: number
    limit: number
    has_more: boolean
    items: SubjectListItem[]
}

export const useSubjects = (props: SubjectListReqQuery) => {
    const result = useQuery({
        queryKey: ["subjects", props],
        queryFn: async () => trpcClient.subjects.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
