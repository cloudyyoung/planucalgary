import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import api, { queryClient } from "@/api"
import { RequisiteListReqQuery } from "@planucalgary/shared"

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

export const useRequisitesGenerateChoices = () => {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/requisites/${id}/`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisites'] })
    }
  })

  return mutation
}
