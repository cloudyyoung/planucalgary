import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CourseListReqQuery, CourseListResBody } from "@planucalgary/shared"
import api from "@/api"

export const useCourses = ({ keywords, offset, limit }: CourseListReqQuery) => {
  const result = useQuery<CourseListResBody>({
    queryKey: ['courses', keywords, offset, limit],
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

  return result
}
