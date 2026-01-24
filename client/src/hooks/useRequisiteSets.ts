import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { RequisiteSetListReqQuery, RequisiteSetListResBody } from "@planucalgary/shared"
import api from "@/api"

export const useRequisiteSets = (props: RequisiteSetListReqQuery) => {
    const result = useQuery<RequisiteSetListResBody>({
        queryKey: ['requisite-sets', ...Object.values(props)],
        queryFn: async () => {
            const response = await api.get('/requisite-sets', {
                params: props,
            })
            return response.data
        },
        placeholderData: keepPreviousData,
    })

    return result
}
