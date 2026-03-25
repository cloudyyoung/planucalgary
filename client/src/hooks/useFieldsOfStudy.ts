import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>
type FieldsOfStudyListOutput = RouterOutput["fields_of_study"]["list"]

export const useFieldsOfStudy = (props: RouterInput["fields_of_study"]["list"]) => {
    const result = useQuery<FieldsOfStudyListOutput>({
        queryKey: ["field-of-studies", props],
        queryFn: async () => trpcClient.fields_of_study.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
