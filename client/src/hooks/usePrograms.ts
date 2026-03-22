import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ProgramListReqQuery } from "@contracts"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterOutput = inferRouterOutputs<AppRouter>
type ProgramListOutput = RouterOutput["programs"]["list"]

export const usePrograms = (props: ProgramListReqQuery) => {
    const result = useQuery<ProgramListOutput>({
        queryKey: ["programs", props],
        queryFn: async () => trpcClient.programs.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
