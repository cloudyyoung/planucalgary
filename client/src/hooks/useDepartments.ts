import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { DepartmentListReqQuery, DepartmentListResBody } from "@planucalgary/shared"
import api from "@/api"

export const useDepartments = (props: DepartmentListReqQuery) => {
    const result = useQuery<DepartmentListResBody>({
        queryKey: ['departments', ...Object.values(props)],
        queryFn: async () => {
            const response = await api.get('/departments', {
                params: props,
            })
            return response.data
        },
        placeholderData: keepPreviousData,
    })

    return result
}
