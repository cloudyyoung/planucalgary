import { keepPreviousData, useQuery } from "@tanstack/react-query"
import api, { ApiPaginatedResponse } from "@/api"

export interface UseCoursesOptions {
  keywords?: string
  offset?: number
  limit?: number
}

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

export const useCourses = ({keywords, offset, limit}: UseCoursesOptions) => {
  const result = useQuery<ApiPaginatedResponse<Course>>({
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
