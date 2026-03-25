import { TRPCError, initTRPC } from "@trpc/server"

import { Context } from "./context"

const t = initTRPC.context<Context>().create()

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

const enforceAuthenticatedUser = t.middleware(({ ctx, next }) => {
  if (!ctx.account) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({
    ctx: {
      ...ctx,
      account: ctx.account,
    },
  })
})

export const authenticatedProcedure = t.procedure.use(enforceAuthenticatedUser)

const enforceAdminUser = t.middleware(({ ctx, next }) => {
  if (!ctx.account || !ctx.account.is_admin) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({
    ctx: {
      ...ctx,
      account: ctx.account,
    },
  })
})

export const adminProcedure = t.procedure.use(enforceAdminUser)
