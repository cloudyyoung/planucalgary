import { NextFunction, Response, Request } from "express"
import { PaginateFn, PaginatedRequestSchema } from "@planucalgary/shared"

export const pagination = () => async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") {
    return next()
  }

  const parsed = PaginatedRequestSchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error }).end()
  }

  const offset = parsed.data.offset || 0
  const limit = parsed.data.limit || 100

  delete req.query.offset
  delete req.query.limit

  req.pagination = {
    offset,
    limit,
  }

  res.paginate = (items, total) => {
    const { offset, limit } = req.pagination
    const has_more = total - (offset + limit) > 0

    return res.json({
      total,
      offset,
      limit,
      has_more,
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

  interface Response {
    paginate: PaginateFn
  }
}
