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

export const useRequisitesGenerateChoices = (id: string, props: RequisiteListReqQuery) => {
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/requisites/${id}/`)
      return response.data
    },
    onSuccess: (data) => {
      updateRequisiteData(id, data, props)
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
    onSuccess: (data) => {
      updateRequisiteData(id, data, props)
    },
  })

  return mutation
}

const updateRequisiteData = (id: string, data: any, props: RequisiteListReqQuery) => {
  queryClient.setQueryData(['requisites', ...Object.values(props)], (oldData?: RequisiteListResBody) => {
    if (!oldData) return oldData
    const newData = {
      ...oldData,
      items: oldData.items.map((requisite) => {
        if (requisite.id === id) {
          return {
            ...requisite,
            ...data,
          }
        }
        return requisite
      }),
    }
    return newData
  })
}

