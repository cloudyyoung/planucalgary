import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CourseSetListReqQuery, CourseSetListResBody } from "@planucalgary/shared"
import api from "@/api"

export const useCourseSets = (props: CourseSetListReqQuery) => {
  const result = useQuery<CourseSetListResBody>({
    queryKey: ['course-sets', ...Object.values(props)],
    queryFn: async () => {
      const response = await api.get('/course-sets', {
        params: props,
      })
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  return result
}
