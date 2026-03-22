import { createTRPCRouter, protectedProcedure, publicProcedure } from "./init"

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      now: new Date().toISOString(),
    }
  }),

  viewer: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.account.id,
      email: ctx.account.email,
      name: ctx.account.name,
    }
  }),
})

export type AppRouter = typeof appRouter