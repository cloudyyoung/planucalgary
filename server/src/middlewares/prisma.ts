import { NextFunction, Response, Request } from "express"
import { PrismaClient } from "@prisma/client"

export const prismaClient = new PrismaClient()

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
