import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CourseListReqQuery, CourseListResBody } from "@planucalgary/shared"
import api from "@/api"

export const useCourses = (props: CourseListReqQuery) => {
  const result = useQuery<CourseListResBody>({
    queryKey: ['courses', ...Object.values(props)],
    queryFn: async () => {
      const response = await api.get('/courses', {
        params: props,
      })
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  return result
}
