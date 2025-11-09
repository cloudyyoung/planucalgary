import jwt from "jsonwebtoken"

export interface JwtContent {
  id: string
  email: string
}

export const generateAccessToken = (payload: JwtContent, key: string): string => {
  return jwt.sign(payload, key, { expiresIn: "864000s", algorithm: "HS256", issuer: "plan-ucalgary-api" })
}
