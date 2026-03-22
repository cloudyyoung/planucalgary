import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>
export type SubjectListOutput = RouterOutput["subjects"]["list"]
export type SubjectListItem = SubjectListOutput["items"][number]

export const useSubjects = (props: RouterInput["subjects"]["list"]) => {
    const result = useQuery({
        queryKey: ["subjects", props],
        queryFn: async () => trpcClient.subjects.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
