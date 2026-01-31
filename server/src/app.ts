import "reflect-metadata"
import express, { Express } from "express"
import cors from "cors"
import compression from "compression"
import morgan from "morgan"
import helmet from "helmet"
import bodyParser from "body-parser"
import { expressjwt as jwt } from "express-jwt"

import { router as accountRouter } from "./api/accounts/routes"
import { router as courseRouter } from "./api/courses/routes"
import { router as requisitesRouter } from "./api/requisites/routes"
import { router as facultyRouter } from "./api/faculties/routes"
import { router as subjectRouter } from "./api/subjects/routes"
import { router as departmentRouter } from "./api/departments/routes"
import { router as programRouter } from "./api/programs/routes"
import { router as courseSetRouter } from "./api/course-sets/routes"
import { router as requisiteSetRouter } from "./api/requisite-sets/routes"
import { router as FieldsOfStudyRouter } from "./api/fields-of-study/routes"
import { router as queueRouter } from "./api/queue/routes"
import { PORT, JWT_SECRET_KEY } from "./config"
import { auth, errors, pagination, prisma } from "./middlewares"
import { emptyget } from "./middlewares/empty-get"
import { initWorkers, closeQueues } from "./queue"

const load = async (app: Express) => {
  process.on("uncaughtException", async (error) => {
    console.log(error)
  })

  process.on("unhandledRejection", async (ex) => {
    console.log(ex)
  })

  app.enable("trust proxy")
  app.set("query parser", 'extended')
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cors())
  app.use(morgan("dev"))
  app.use(helmet())
  app.use(compression())
  app.use(prisma())
  app.use(
    jwt({ secret: JWT_SECRET_KEY!, algorithms: ["HS256"], issuer: "plan-ucalgary-api" }).unless({
      path: ["/accounts/signin", "/accounts/signup"],
    }),
    auth(),
  )
  app.use(emptyget())
  app.use(pagination())

  app.use("/accounts", accountRouter)
  app.use("/courses", courseRouter)
  app.use("/requisites", requisitesRouter)
  app.use("/faculties", facultyRouter)
  app.use("/subjects", subjectRouter)
  app.use("/departments", departmentRouter)
  app.use("/programs", programRouter)
  app.use("/course-sets", courseSetRouter)
  app.use("/requisite-sets", requisiteSetRouter)
  app.use("/field-of-studies", FieldsOfStudyRouter)
  app.use("/queue", queueRouter)

  app.get("/", (_req, res) => {
    return res.status(200).json({ message: "ok" }).end()
  })

  app.use(errors())

  // Initialize BullMQ workers
  initWorkers()

  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
  })

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received: closing HTTP server and queues")
    await closeQueues()
    process.exit(0)
  })

  process.on("SIGINT", async () => {
    console.log("SIGINT signal received: closing HTTP server and queues")
    await closeQueues()
    process.exit(0)
  })
}

const app = express()
load(app)

export default app
