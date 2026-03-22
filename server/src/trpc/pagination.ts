import { z } from "zod"

const DEFAULT_OFFSET = 0
const DEFAULT_LIMIT = 500

export const paginationInputSchema = z.object({
  offset: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(0).max(5000).optional(),
})

type PaginationInput = z.infer<typeof paginationInputSchema>

export const resolvePagination = (input: PaginationInput) => {
  const offset = input.offset ?? DEFAULT_OFFSET
  const limit = input.limit ?? DEFAULT_LIMIT

  return { offset, limit }
}