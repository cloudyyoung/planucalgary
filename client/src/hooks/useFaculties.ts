import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FacultyListReqQuery, FacultyListResBody } from "@planucalgary/shared"
import api from "@/api"

export const useFaculties = (props: FacultyListReqQuery) => {
    const result = useQuery<FacultyListResBody>({
        queryKey: ['faculties', ...Object.values(props)],
        queryFn: async () => {
            const response = await api.get('/faculties', {
                params: props,
            })
            return response.data
        },
        placeholderData: keepPreviousData,
    })

    return result
}
