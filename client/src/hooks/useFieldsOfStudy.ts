import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type FieldsOfStudyListInput = RouterInput["fields_of_study"]["list"]
type FieldsOfStudyListOutput = RouterOutput["fields_of_study"]["list"]
export type FieldsOfStudyListItem = FieldsOfStudyListOutput["items"][number]

export const useFieldsOfStudy = (props: FieldsOfStudyListInput) => {
  const result = useQuery<FieldsOfStudyListOutput>({
    queryKey: ["field-of-studies", props],
    queryFn: async () => trpcClient.fields_of_study.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}
