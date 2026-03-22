import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>
type FieldsOfStudyListOutput = RouterOutput["fieldsOfStudy"]["list"]

export const useFieldsOfStudy = (props: RouterInput["fieldsOfStudy"]["list"]) => {
    const result = useQuery<FieldsOfStudyListOutput>({
        queryKey: ["field-of-studies", props],
        queryFn: async () => trpcClient.fieldsOfStudy.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
