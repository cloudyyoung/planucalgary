import { TRPCError, initTRPC } from "@trpc/server"

import { TRPCContext } from "./context"

const t = initTRPC.context<TRPCContext>().create()

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

export const protectedProcedure = t.procedure.use(enforceAuthenticatedUser)