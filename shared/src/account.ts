import * as z from "zod"

export const SignInInputSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
})

export type SignInInput = z.infer<typeof SignInInputSchema>

export const SignUpInputSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
})

export type SignUpInput = z.infer<typeof SignUpInputSchema>
