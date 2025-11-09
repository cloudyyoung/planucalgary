import { Request, Response } from "express"
import bcrypt from "bcrypt"

import { JWT_SECRET_KEY } from "../../../config"
import { InvalidCredentialsError } from "../errors"
import { JwtContent, generateAccessToken } from "../utils"

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const account = await req.prisma.account.findFirst({
    where: {
      email,
    },
  })

  if (!account) {
    throw new InvalidCredentialsError()
  }

  const match = await bcrypt.compare(password, account.password)
  if (!match) {
    throw new InvalidCredentialsError()
  }

  const payload: JwtContent = {
    id: account.id,
    email: account.email,
  }

  const token = generateAccessToken(payload, JWT_SECRET_KEY!)

  return res.status(200).json({ token })
}
