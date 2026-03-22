import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { queryClient } from "@/api"
import { RequisiteListReqQuery, RequisitesSyncDestination, RequisiteUpdateReqBody } from "@contracts"
import { trpcClient } from "@/trpc"

export const useRequisites = (props: RequisiteListReqQuery) => {
  const result = useQuery({
    queryKey: ['requisites', JSON.stringify(props)],
    queryFn: async () => trpcClient.requisites.list.query(props),
    placeholderData: keepPreviousData,
  })

  return result
}

export const useRequisitesGenerateChoices = (props: RequisiteListReqQuery) => {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      return trpcClient.requisites.generateChoices.mutate({ id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites', JSON.stringify(props)] })
    }
  })

  return mutation
}

export const useRequisitesUpdate = (props: RequisiteListReqQuery) => {
  const mutation = useMutation({
    mutationFn: async (data: RequisiteUpdateReqBody) => {
      return trpcClient.requisites.update.mutate(data as RequisiteUpdateReqBody & { id: string })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites', JSON.stringify(props)] })
    },
  })

  return mutation
}

export const useRequisitesSync = () => {
  const mutation = useMutation({
    mutationFn: async (destination: RequisitesSyncDestination) => {
      return trpcClient.requisites.sync.mutate(destination)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites'] })
    },
  })

  return mutation
}