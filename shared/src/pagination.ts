import { Response } from "express"
import * as z from "zod"

export const PaginationRequestSchema = z.object({
    offset: z.number().int().min(0).optional(),
    limit: z.number().int().min(0).max(5000).optional(),
}).loose()

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>

export interface PaginatedResponse<T> {
    total: number
    offset: number
    limit: number
    has_more: boolean
    items: T[]
}

export type PaginateFn = <T>(items: T[], total: number) => Response<PaginatedResponse<T>>