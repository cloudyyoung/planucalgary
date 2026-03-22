import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FieldsOfStudyListReqQuery } from "@contracts"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterOutput = inferRouterOutputs<AppRouter>
type FieldsOfStudyListOutput = RouterOutput["fieldsOfStudy"]["list"]

export const useFieldsOfStudy = (props: FieldsOfStudyListReqQuery) => {
    const result = useQuery<FieldsOfStudyListOutput>({
        queryKey: ["field-of-studies", props],
        queryFn: async () => trpcClient.fieldsOfStudy.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
