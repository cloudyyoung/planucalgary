import { NextFunction, Response, Request } from "express"
import { z } from "zod"

const PaginatedRequestSchema = z.object({
  offset: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(0).max(5000).optional(),
})

type PaginatedResponse<T> = {
  total: number
  offset: number
  limit: number
  items: T[]
}

export const pagination = () => async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") {
    return next()
  }

  const parsed = PaginatedRequestSchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json(z.treeifyError(parsed.error)).end()
  }

  const offset = parsed.data.offset || 0
  const limit = parsed.data.limit || 100

  req.pagination = {
    offset,
    limit,
  }

  res.paginate = (items, total) => {
    const { offset, limit } = req.pagination

    return res.json({
      total,
      offset,
      limit,
      items,
    })
  }

  next()
}

declare module "express-serve-static-core" {
  interface Request {
    pagination: {
      offset: number
      limit: number
    }
  }

  interface Response<
    ResBody = any,
    LocalsObj extends Record<string, any> = Record<string, any>,
    StatusCode extends number = number,
  > {
    paginate: ResBody extends PaginatedResponse<infer T>
    ? (body: T[], total: number) => this
    : never
  }
}
