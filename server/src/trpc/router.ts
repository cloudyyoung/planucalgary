import { createTRPCRouter, protectedProcedure, publicProcedure } from "./init"
import { accountsRouter } from "./routers/accounts"
import { courseSetsRouter } from "./routers/course-sets"
import { coursesRouter } from "./routers/courses"
import { departmentsRouter } from "./routers/departments"
import { facultiesRouter } from "./routers/faculties"
import { fieldsOfStudyRouter } from "./routers/fields-of-study"
import { programsRouter } from "./routers/programs"
import { queuesRouter } from "./routers/queues"
import { requisiteRulesRouter } from "./routers/requisite-rules"
import { requisiteSetsRouter } from "./routers/requisite-sets"

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
  fieldsOfStudy: fieldsOfStudyRouter,
  programs: programsRouter,
  queues: queuesRouter,
  requisiteRules: requisiteRulesRouter,
  requisiteSets: requisiteSetsRouter,

  account: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.account.id,
      email: ctx.account.email,
      name: ctx.account.name,
    }
  }),
})

export type AppRouter = typeof appRouter