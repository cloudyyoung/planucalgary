import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import api, { queryClient } from "@/api"
import { RequisiteListReqQuery, RequisiteUpdateReqBody } from "@planucalgary/shared"

export const useRequisites = (props: RequisiteListReqQuery) => {
  const result = useQuery({
    queryKey: ['requisites', ...Object.values(props)],
    queryFn: async () => {
      const response = await api.get('/requisites', {
        params: props,
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
      const response = await api.put(`/requisites/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites'] })
    },
  })

  return mutation
}
