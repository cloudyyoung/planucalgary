import { NextFunction, Response, Request } from "express"

export const emptyget = () => async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") {
    return next()
  }

  const originalJson = res.json

  res.json = function (data) {
    if (data === null) {
      return res.status(404).end()
    }
    return originalJson.call(this, data)
  }

  next()
}
