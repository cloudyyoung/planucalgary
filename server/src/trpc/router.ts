import { createTRPCRouter, authenticatedProcedure, publicProcedure } from "./init"
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
import { requisitesRouter } from "./routers/requisites"
import { subjectsRouter } from "./routers/subjects"

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
  requisites: requisitesRouter,
  subjects: subjectsRouter,
})

export type AppRouter = typeof appRouter