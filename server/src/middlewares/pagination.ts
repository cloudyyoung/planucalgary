import { NextFunction, Response, Request } from "express"
import { z } from "zod"
import { PaginatedRequestSchema, PaginatedResponse } from "@planucalgary/shared"

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
