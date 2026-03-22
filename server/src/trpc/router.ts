import { createTRPCRouter, protectedProcedure, publicProcedure } from "./init"
import { accountsRouter } from "./routers/accounts"

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      now: new Date().toISOString(),
    }
  }),

  accounts: accountsRouter,

  account: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.account.id,
      email: ctx.account.email,
      name: ctx.account.name,
    }
  }),
})

export type AppRouter = typeof appRouter