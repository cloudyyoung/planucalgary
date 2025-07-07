import { keepPreviousData, useQuery } from "@tanstack/react-query"
import api from "@/api"

export interface UseCoursesOptions {
  keywords?: string
  offset?: number
  limit?: number
}

export const useCourses = ({keywords, offset, limit}: UseCoursesOptions) => {
  const result = useQuery({
    queryKey: ['courses', offset, limit, keywords],
    queryFn: async () => {
      const response = await api.get('/courses', {
        params: {
          keywords,
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
    courses: result.data?.items || [],
    total: result.data?.total || 0,
  }
}
