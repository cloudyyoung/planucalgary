import * as z from "zod"

export const PaginatedRequestSchema = z.object({
    offset: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(0).max(5000).optional(),
}).loose()

export type PaginatedRequest<T> = z.infer<typeof PaginatedRequestSchema> & T

export interface PaginatedResponse<T> {
    total: number
    offset: number
    limit: number
    has_more: boolean
    items: T[]
}
