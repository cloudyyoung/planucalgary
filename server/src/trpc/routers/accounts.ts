import bcrypt from "bcrypt"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { JWT_SECRET_KEY } from "../../config"
import { generateAccessToken, JwtContent } from "./accounts-utils"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init"

const SignInInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const SignUpInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const accountsRouter = createTRPCRouter({
  signin: publicProcedure.input(SignInInputSchema).mutation(async ({ ctx, input }) => {
    const account = await ctx.prisma.account.findFirst({
      where: {
        email: input.email,
      },
    })

    if (!account) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials provided for authentication.",
      })
    }

    const match = await bcrypt.compare(input.password, account.password)
    if (!match) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials provided for authentication.",
      })
    }

    const payload: JwtContent = {
      id: account.id,
      email: account.email,
    }

    return {
      token: generateAccessToken(payload, JWT_SECRET_KEY!),
    }
  }),

  signup: publicProcedure.input(SignUpInputSchema).mutation(async ({ ctx, input }) => {
    const emailCheck = await ctx.prisma.account.findFirst({
      where: {
        email: input.email,
      },
    })

    if (emailCheck) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already exists.",
      })
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const account = await ctx.prisma.account.create({
      data: {
        email: input.email,
        password: passwordHash,
      },
    })

    const payload: JwtContent = {
      id: account.id,
      email: account.email,
    }

    return {
      token: generateAccessToken(payload, JWT_SECRET_KEY!),
    }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.account.id,
      email: ctx.account.email,
      name: ctx.account.name,
      is_admin: ctx.account.is_admin,
    }
  }),
})