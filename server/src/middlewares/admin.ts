import { NextFunction, Request, Response } from "express"
import { UnauthorizedError } from "express-jwt"

export const admin = () => async (req: Request, res: Response, next: NextFunction) => {
  if (!req.account || !req.account.is_admin) {
    throw new UnauthorizedError("invalid_token", { message: "Unauthorized endpoint" })
  }
  next()
}
