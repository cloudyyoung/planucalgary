import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { QueryClient } from "@tanstack/react-query"
import type { Router } from "../../server/src/trpc/router"

const API_BASE_URL = "http://localhost:5150"
const API_AUTHORIZATION =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4OGI1OTVhLTU1NmMtNDQ0YS1iYjExLTk4ZjY1OTg2YWJjMSIsImVtYWlsIjoiY2xvdWR5LnlvdW5nQG91dGxvb2suY29tIiwiaXNzIjoicGxhbi11Y2FsZ2FyeS1hcGkiLCJpYXQiOjE3NzQ0MzM1NTAsImV4cCI6MTgwNTk2OTU1MH0.LTwcLgfsudnz1jIZ_-RUrHGlgN4hfMELz23UPcnt9zc"

export const queryClient = new QueryClient()

export const trpcClient = createTRPCClient<Router>({
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


