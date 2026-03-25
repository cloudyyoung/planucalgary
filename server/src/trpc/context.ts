import { Request, Response } from "express"
import { Account, PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import jwt, { type JwtPayload } from "jsonwebtoken"

import { JWT_SECRET_KEY, DATABASE_URL } from "../config"

const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const prismaClient = new PrismaClient({ adapter })

declare module "express-serve-static-core" {
  interface Request {
    prisma: PrismaClient
  }
}

type AuthPayload = JwtPayload & {
  id: string
}

export type TRPCContext = {
  req: Request
  res: Response
  prisma: PrismaClient
  account: Account | null
}

const getAccountFromBearer = async (req: Request, prisma: PrismaClient): Promise<Account | null> => {
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

    const account = await prisma.account.findFirst({ where: { id: payload.id } })

    return account ?? null
  } catch {
    return null
  }
}

export const createTRPCContext = async ({ req, res }: { req: Request; res: Response }): Promise<TRPCContext> => {
  return {
    req,
    res,
    prisma: prismaClient,
    account: await getAccountFromBearer(req, prismaClient),
  }
}
