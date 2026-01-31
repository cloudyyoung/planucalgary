import { useQuery } from "@tanstack/react-query"
import { QueueStatusResBody } from "@planucalgary/shared"
import api from "@/api"

export const useQueueStatus = () => {
  const result = useQuery<QueueStatusResBody>({
    queryKey: ['queue', 'catalog'],
    queryFn: async () => {
      const response = await api.get('/queues/catalog')
      return response.data
    },
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  })

  return result
}
