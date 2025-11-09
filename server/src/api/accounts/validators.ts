import { z } from "zod"

export const SignInInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const SignUpInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
})
