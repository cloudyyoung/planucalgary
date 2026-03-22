import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { DepartmentListReqQuery } from "@contracts"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterOutput = inferRouterOutputs<AppRouter>
type DepartmentListOutput = RouterOutput["departments"]["list"]

export const useDepartments = (props: DepartmentListReqQuery) => {
    const result = useQuery<DepartmentListOutput>({
        queryKey: ["departments", props],
        queryFn: async () => trpcClient.departments.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
