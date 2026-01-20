import { NextFunction, Response, Request } from "express"
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@planucalgary/shared/prisma/client"
import { DATABASE_URL } from "../config"

export const adapter = new PrismaPg({ connectionString: DATABASE_URL })
export const prismaClient = new PrismaClient({ adapter })

export const prisma = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.prisma = prismaClient
    next()
  }
}

declare module "express-serve-static-core" {
  interface Request {
    prisma: PrismaClient
  }
}
