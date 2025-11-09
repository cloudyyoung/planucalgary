import { Request, Response } from "express"
import bcrypt from "bcrypt"

import { JWT_SECRET_KEY } from "../../../config"
import { EmailExistsError } from "../errors"
import { JwtContent, generateAccessToken } from "../utils"

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const emailCheck = await req.prisma.account.findFirst({
    where: {
      email,
    },
  })
  if (emailCheck) {
    throw new EmailExistsError()
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const account = await req.prisma.account.create({
    data: {
      email,
      password: passwordHash,
    },
  })

  const payload: JwtContent = {
    id: account.id,
    email: account.email,
  }

  const token = generateAccessToken(payload, JWT_SECRET_KEY!)
  return res.status(200).json({ token })
}
