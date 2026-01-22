import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ProgramListReqQuery, ProgramListResBody } from "@planucalgary/shared"
import api from "@/api"

export const usePrograms = (props: ProgramListReqQuery) => {
    const result = useQuery<ProgramListResBody>({
        queryKey: ['programs', ...Object.values(props)],
        queryFn: async () => {
            const response = await api.get('/programs', {
                params: props,
            })
            return response.data
        },
        placeholderData: keepPreviousData,
    })

    return result
}
