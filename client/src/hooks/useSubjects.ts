import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type SubjectListInput = RouterInput["subjects"]["list"]
export type SubjectListOutput = RouterOutput["subjects"]["list"]
export type SubjectListItem = SubjectListOutput["items"][number]

export const useSubjects = (props: SubjectListInput) => {
  const result = useQuery<SubjectListOutput>({
    queryKey: ["subjects", props],
    queryFn: async () => trpcClient.subjects.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
