import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import api, { queryClient } from "@/api"
import { RequisiteGenerateChoicesResBody, RequisiteListReqQuery, RequisiteListResBody, RequisitesSyncDestination, RequisitesSyncResBody, RequisiteUpdateReqBody, RequisiteUpdateResBody } from "@planucalgary/shared"

export const useRequisites = (props: RequisiteListReqQuery) => {
  const result = useQuery({
    queryKey: ['requisites', JSON.stringify(props)],
    queryFn: async () => {
      const response = await api.get<RequisiteListResBody>('/requisites', {
        params: props,
        timeout: 10000,
      })
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  return result
}

export const useRequisitesGenerateChoices = (props: RequisiteListReqQuery) => {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<RequisiteGenerateChoicesResBody>(`/requisites/${id}/`, {}, { timeout: 20000 })
      return response.data
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
      const response = await api.put<RequisiteUpdateResBody>(`/requisites/${data.id}/`, data, { timeout: 20000 })
      return response.data
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
      const response = await api.post<RequisitesSyncResBody>('/requisites/sync', {
        destination,
      }, { timeout: 60000 })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites'] })
    },
  })

  return mutation
}