import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CourseListReqQuery, CourseListResBody } from "@planucalgary/shared"
import api from "@/api"

export type Course = {
  id: string
  code: string
  subject_code: string
  course_number: string
  long_name: string
  description: string
  units: number

  aka: string[]
  antireq: string
  antireq_json: {}
  coreq: string
  coreq_json: {}
  prereq: string
  prereq_json: {}

  is_active: boolean
  is_multi_term: boolean
  is_no_gpa: boolean
  is_repeatable: boolean
}

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
