import { trpcClient } from "@/trpc"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { Router } from "../../../server/src/trpc/router"

type RouterInput = inferRouterInputs<Router>
type RouterOutput = inferRouterOutputs<Router>
type QueueStatusInput = RouterInput["queues"]["catalog"]
export type QueueStatusOutput = RouterOutput["queues"]["catalog"]

export const useQueueStatus = (_props: QueueStatusInput) => {
  const result = useQuery<QueueStatusOutput>({
    queryKey: ["queue", "catalog"],
    queryFn: async () => trpcClient.queues.catalog.query(),
    refetchInterval: 2000,
  })

  return result
}
