import { keepPreviousData, useQuery } from "@tanstack/react-query"
import api from "@/api"
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
