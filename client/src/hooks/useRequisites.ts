import { keepPreviousData, useQuery } from "@tanstack/react-query"
import api from "@/api"

export interface UseRequisitesOptions {
  offset?: number
  limit?: number
  type?: "PREREQ" | "COREQ" | "ANTIREQ"
}

export const useRequisites = ({offset, limit, type}: UseRequisitesOptions) => {
  const result = useQuery({
    queryKey: ['requisites', offset, limit, type],
    queryFn: async () => {
      const response = await api.get('/requisites', {
        params: {
          offset,
          limit,
          type,
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
