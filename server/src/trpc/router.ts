import { createTRPCRouter, protectedProcedure, publicProcedure } from "./init"
import { accountsRouter } from "./routers/accounts"
import { courseSetsRouter } from "./routers/course-sets"
import { coursesRouter } from "./routers/courses"
import { departmentsRouter } from "./routers/departments"
import { facultiesRouter } from "./routers/faculties"

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      now: new Date().toISOString(),
    }
  }),

  accounts: accountsRouter,
  courseSets: courseSetsRouter,
  courses: coursesRouter,
  departments: departmentsRouter,
  faculties: facultiesRouter,

  account: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.account.id,
      email: ctx.account.email,
      name: ctx.account.name,
    }
  }),
})

export type AppRouter = typeof appRouter