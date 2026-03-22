import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { API_AUTHORIZATION, API_BASE_URL } from "./api"

export const trpcClient = createTRPCClient<any>({
  links: [
    httpBatchLink({
      url: `${API_BASE_URL}/trpc`,
      headers() {
        return {
          authorization: API_AUTHORIZATION,
        }
      },
    }),
  ],
})