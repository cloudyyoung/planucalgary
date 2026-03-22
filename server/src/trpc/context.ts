import { Request, Response } from "express"
import { Account, PrismaClient } from "../contracts/generated/prisma/client"
import { JwtPayload, verify } from "jsonwebtoken"

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

const getRequestPrisma = (req: Request): PrismaClient => {
  return (req as any).prisma as PrismaClient
}

const getRequestAccount = (req: Request): Account | null => {
  return ((req as any).account ?? null) as Account | null
}

const getAccountFromAuthorization = async (req: Request): Promise<Account | null> => {
  const requestAccount = getRequestAccount(req)
  if (requestAccount) {
    return requestAccount
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

    const account = await getRequestPrisma(req).account.findFirst({
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
    prisma: getRequestPrisma(req),
    account,
  }
}