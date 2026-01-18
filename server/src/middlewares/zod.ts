import { NextFunction, Request, Response } from "express"
import { z, ZodType } from "zod"

export interface ZodmiddlewareOptions {
  params?: ZodType // URL params, e.g. /:id
  query?: ZodType // URL query, e.g. ?id=1
  body?: ZodType // Request body, e.g. { id: 1 }
}

export const zod = (options: ZodmiddlewareOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (options.params) {
      const parsed = options.params.safeParse(req.params)
      if (!parsed.success) {
        return res.status(400).json(z.treeifyError(parsed.error)).end()
      }
    }
    if (options.query) {
      const parsed = options.query.safeParse(req.query)
      if (!parsed.success) {
        return res.status(400).json(z.treeifyError(parsed.error)).end()
      }
    }
    if (options.body) {
      const parsed = options.body.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json(z.treeifyError(parsed.error)).end()
      }
    }
    next()
  }
}
