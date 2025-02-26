import { keepPreviousData, useQuery } from "@tanstack/react-query"
import api from "src/api"

export interface UseRequisitesOptions {
  offset?: number
  limit?: number
}

export const useRequisites = ({offset, limit}: UseRequisitesOptions) => {
  const result = useQuery({
    queryKey: ['requisites', offset, limit],
    queryFn: async () => {
      const response = await api.get('/requisites', {
        params: {
          offset,
          limit,
        }
      })
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  return {
    ...result,
    requisites: result.data?.items || [],
    total: result.data?.total || 0,
  }
}
