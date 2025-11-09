import { NextFunction, Request, Response } from "express"
import { Request as JWTRequest } from "express-jwt"
import { Account } from "@prisma/client"

export const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as JWTRequest).auth
    if (auth) {
      const account = await req.prisma.account.findFirst({
        where: {
          id: auth.id,
        },
      })
      if (account) {
        req.account = account
      }
    }
    next()
  }
}

declare module "express-serve-static-core" {
  interface Request {
    account?: Account
  }
}
