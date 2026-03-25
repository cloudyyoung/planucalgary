import { Request, Response } from "express"
import { Account, PrismaClient } from "../generated/prisma/client"
import jwt, { type JwtPayload } from "jsonwebtoken"

import { JWT_SECRET_KEY } from "../config"

type AuthPayload = JwtPayload & {
  id: string
}

export type TRPCContext = {
  req: Request
  res: Response
  prisma: PrismaClient
  account: Account | null
}

const getAccountFromBearer = async (req: Request): Promise<Account | null> => {
  const authorization = req.headers.authorization
  if (!authorization || !authorization.startsWith("Bearer ") || !JWT_SECRET_KEY) {
    return null
  }

  try {
    const token = authorization.slice("Bearer ".length)
    const payload = jwt.verify(token, JWT_SECRET_KEY, {
      algorithms: ["HS256"],
      issuer: "plan-ucalgary-api",
    }) as AuthPayload

    const account = await req.prisma.account.findFirst({ where: { id: payload.id } })

    return account ?? null
  } catch {
    return null
  }
}

export const createTRPCContext = async ({ req, res }: { req: Request; res: Response }): Promise<TRPCContext> => {
  return {
    req,
    res,
    prisma: req.prisma,
    account: await getAccountFromBearer(req),
  }
}