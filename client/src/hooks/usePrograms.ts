import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>
type ProgramListOutput = RouterOutput["programs"]["list"]

export const usePrograms = (props: RouterInput["programs"]["list"]) => {
    const result = useQuery<ProgramListOutput>({
        queryKey: ["programs", props],
        queryFn: async () => trpcClient.programs.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
