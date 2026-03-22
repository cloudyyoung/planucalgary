import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { QueryClient } from "@tanstack/react-query"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import type { AppRouter } from "../../server/src/trpc/router"

const API_BASE_URL = "http://localhost:5150"
const API_AUTHORIZATION =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4OGI1OTVhLTU1NmMtNDQ0YS1iYjExLTk4ZjY1OTg2YWJjMSIsImVtYWlsIjoiY2xvdWR5LnlvdW5nQG91dGxvb2suY29tIiwiaWF0IjoxNzczNDcwMTU5LCJleHAiOjE3NzQzMzQxNTksImlzcyI6InBsYW4tdWNhbGdhcnktYXBpIn0.n6fDyJw0VZgnbqTBpiTYppGpBWNtaJ1Y-PTYWDjAmd0"

export const queryClient = new QueryClient()

export const trpcClient = createTRPCClient<AppRouter>({
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


