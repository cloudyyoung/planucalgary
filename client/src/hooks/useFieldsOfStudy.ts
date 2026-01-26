import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FieldsOfStudyListReqQuery, FieldsOfStudyListResBody } from "@planucalgary/shared"
import api from "@/api"

export const useFieldsOfStudy = (props: FieldsOfStudyListReqQuery) => {
    const result = useQuery<FieldsOfStudyListResBody>({
        queryKey: ['field-of-studies', ...Object.values(props)],
        queryFn: async () => {
            const response = await api.get('/field-of-studies', {
                params: props,
            })
            return response.data
        },
        placeholderData: keepPreviousData,
    })

    return result
}
