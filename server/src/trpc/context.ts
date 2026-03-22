import { Request, Response } from "express"
import { Account } from "@planucalgary/shared/prisma/client"
import { JwtPayload, verify } from "jsonwebtoken"

import { JWT_SECRET_KEY } from "../config"

type AuthPayload = JwtPayload & {
  id: string
}

export type TRPCContext = {
  req: Request
  res: Response
  prisma: Request["prisma"]
  account: Account | null
}

const getAccountFromAuthorization = async (req: Request): Promise<Account | null> => {
  if (req.account) {
    return req.account
  }

  const authorization = req.headers.authorization
  if (!authorization || !authorization.startsWith("Bearer ") || !JWT_SECRET_KEY) {
    return null
  }

  try {
    const token = authorization.slice("Bearer ".length)
    const payload = verify(token, JWT_SECRET_KEY, {
      algorithms: ["HS256"],
      issuer: "plan-ucalgary-api",
    }) as AuthPayload

    const account = await req.prisma.account.findFirst({
      where: {
        id: payload.id,
      },
    })

    return account ?? null
  } catch {
    return null
  }
}

export const createTRPCContext = async ({ req, res }: { req: Request; res: Response }): Promise<TRPCContext> => {
  const account = await getAccountFromAuthorization(req)

  return {
    req,
    res,
    prisma: req.prisma,
    account,
  }
}