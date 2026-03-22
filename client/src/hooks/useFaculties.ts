import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FacultyListReqQuery } from "@contracts"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterOutput = inferRouterOutputs<AppRouter>
type FacultyListOutput = RouterOutput["faculties"]["list"]

export const useFaculties = (props: FacultyListReqQuery) => {
    const result = useQuery<FacultyListOutput>({
        queryKey: ["faculties", props],
        queryFn: async () => trpcClient.faculties.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
