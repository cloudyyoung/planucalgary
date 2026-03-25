import { PrismaPg } from "@prisma/adapter-pg"
import jwt, { type JwtPayload } from "jsonwebtoken"
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';

import { Account, PrismaClient } from "../generated/prisma/client"
import { JWT_SECRET_KEY, DATABASE_URL } from "../config"

const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const prismaClient = new PrismaClient({ adapter })

declare module "express-serve-static-core" {
  interface Request {
    prisma: PrismaClient
    account: Account | null
  }
}

type AuthPayload = JwtPayload & {
  id: string
}

export async function createContext({ req, res }: CreateHTTPContextOptions) {
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const token = req.headers.authorization.slice("Bearer ".length)
      const payload = jwt.verify(token, JWT_SECRET_KEY!, {
        algorithms: ["HS256"],
        issuer: "plan-ucalgary-api",
      }) as AuthPayload

      const account = await prismaClient.account.findFirst({ where: { id: payload.id } })
      return account
    }
    return null;
  }

  const account = await getUserFromHeader();
  const prisma = prismaClient;

  return {
    req,
    res,
    prisma,
    account,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;