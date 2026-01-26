import { Request, Response, NextFunction } from "express"

export const errors = () => async (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ statusCode: 401, error: "UnauthorizedError", message: err.message }).end()
  } else if (err.name.endsWith("AlreadyExistsError")) {
    res.status(409).header({ "Location": err.stack }).json({ statusCode: 409, error: err.name, message: err.message }).end()
  } else {
    res.status(400).json({ statusCode: 400, error: err.name, message: err.message }).end()
  }
  next(err)
}
