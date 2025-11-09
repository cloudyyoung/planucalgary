import { NextFunction, Request, Response } from "express"
import { z, ZodSchema } from "zod"

export interface ZodmiddlewareOptions {
  params?: ZodSchema // URL params, e.g. /:id
  query?: ZodSchema // URL query, e.g. ?id=1
  body?: ZodSchema // Request body, e.g. { id: 1 }
}

export const zod = (options: ZodmiddlewareOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (options.params) {
      const parsed = options.params.safeParse(req.params)
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors }).end()
      }
      req.params = parsed.data
    }
    if (options.query) {
      const parsed = options.query.safeParse(req.query)
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors }).end()
      }
      req.query = parsed.data
    }
    if (options.body) {
      const parsed = options.body.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors }).end()
      }
      req.body = parsed.data
    }
    next()
  }
}

export const IdInputSchema = z.object({
  id: z.string(),
})

export type IdInput = z.infer<typeof IdInputSchema>
