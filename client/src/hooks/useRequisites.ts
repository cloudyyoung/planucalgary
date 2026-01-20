import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import api, { queryClient } from "@/api"
import { RequisiteListReqQuery, RequisiteListResBody, RequisiteUpdateReqBody } from "@planucalgary/shared"

export const useRequisites = (props: RequisiteListReqQuery) => {
  const result = useQuery<RequisiteListResBody>({
    queryKey: ['requisites', ...Object.values(props)],
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

export const useRequisitesGenerateChoices = (id: string) => {
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/requisites/${id}/`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites'] })
    }
  })

  return mutation
}

export const useRequisitesUpdate = (id: string) => {
  const mutation = useMutation({
    mutationFn: async (data: RequisiteUpdateReqBody) => {
      const response = await api.put(`/requisites/${id}/`, data, { timeout: 20000 })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites'] })
    },
  })

  return mutation
}
