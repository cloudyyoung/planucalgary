import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { SubjectListReqQuery, SubjectListResBody } from "@planucalgary/shared"
import api from "@/api"

export const useSubjects = (props: SubjectListReqQuery) => {
    const result = useQuery<SubjectListResBody>({
        queryKey: ['subjects', ...Object.values(props)],
        queryFn: async () => {
            const response = await api.get('/subjects', {
                params: props,
            })
            return response.data
        },
        placeholderData: keepPreviousData,
    })

    return result
}
