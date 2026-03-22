import { useQuery } from "@tanstack/react-query"
import { trpcClient } from "@/trpc"

export type QueueStatusOutput = Awaited<ReturnType<typeof trpcClient.queues.catalog.query>>

export const useQueueStatus = () => {
  const result = useQuery<QueueStatusOutput>({
    queryKey: ['queue', 'catalog'],
    queryFn: async () => trpcClient.queues.catalog.query(),
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  })

  return result
}
