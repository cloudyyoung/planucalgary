import { NextFunction, Response, Request } from "express"
import { z } from "zod"

export const paginationSchema = z
  .object({
    offset: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(0).max(500).optional(),
  })
  .passthrough()

export const pagination = () => async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") {
    return next()
  }

  const parsed = paginationSchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors }).end()
  }

  const offset = parsed.data.offset || 0
  const limit = parsed.data.limit || 100

  delete req.query.offset
  delete req.query.limit

  req.pagination = {
    offset,
    limit,
  }

  res.paginate = <T>(items: T[], total: number) => {
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
    paginate: <T>(items: T[], total: number) => Response
  }
}
