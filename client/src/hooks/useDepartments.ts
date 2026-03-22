import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../../server/src/trpc/router"
import { trpcClient } from "@/trpc"

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>
type DepartmentListOutput = RouterOutput["departments"]["list"]

export const useDepartments = (props: RouterInput["departments"]["list"]) => {
    const result = useQuery<DepartmentListOutput>({
        queryKey: ["departments", props],
        queryFn: async () => trpcClient.departments.list.query(props),
        placeholderData: keepPreviousData,
    })

    return result
}
