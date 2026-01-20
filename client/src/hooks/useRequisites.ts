import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import api, { queryClient } from "@/api"
import { RequisiteListReqQuery, RequisiteListResBody, RequisiteUpdateReqBody } from "@planucalgary/shared"

export const useRequisites = (props: RequisiteListReqQuery) => {
  const result = useQuery<RequisiteListResBody>({
    queryKey: ['requisites', JSON.stringify(props)],
    queryFn: async () => {
      const response = await api.get('/requisites', {
        params: props,
        timeout: 10000,
      })
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  return result
}

export const useRequisitesGenerateChoices = (id: string, props: RequisiteListReqQuery) => {
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/requisites/${id}/`, {}, { timeout: 20000 })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites', JSON.stringify(props)] })
    }
  })

  return mutation
}

export const useRequisitesUpdate = (id: string, props: RequisiteListReqQuery) => {
  const mutation = useMutation({
    mutationFn: async (data: RequisiteUpdateReqBody) => {
      const response = await api.put(`/requisites/${id}/`, data, { timeout: 20000 })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites', JSON.stringify(props)] })
    },
  })

  return mutation
}

