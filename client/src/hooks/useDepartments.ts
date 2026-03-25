import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type DepartmentListInput = RouterInput["departments"]["list"]
type DepartmentListOutput = RouterOutput["departments"]["list"]

export const useDepartments = (props: DepartmentListInput) => {
  const result = useQuery<DepartmentListOutput>({
    queryKey: ["departments", props],
    queryFn: async () => trpcClient.departments.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
