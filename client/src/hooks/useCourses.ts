import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CourseListReqQuery, CourseListResBody } from "@planucalgary/shared"
import { trpcClient } from "@/trpc"

export const useCourses = (props: CourseListReqQuery) => {
  const result = useQuery<CourseListResBody>({
    queryKey: ['courses', ...Object.values(props)],
    queryFn: async () => {
      return (trpcClient as any).courses.list.query(props)
    },
    placeholderData: keepPreviousData,
  })

  return result
}
