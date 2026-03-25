import "reflect-metadata"
import express, { Express } from "express"
import cors from "cors"
import compression from "compression"
import morgan from "morgan"
import helmet from "helmet"
import bodyParser from "body-parser"
import { createExpressMiddleware } from "@trpc/server/adapters/express"

import { PORT } from "./config"
import { closeWorkers } from "./queue"
import { createContext } from "./trpc/context"
import { router } from "./trpc/router"

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
  app.use(
    "/trpc",
    createExpressMiddleware({
      router,
      createContext,
    }),
  )
  app.get("/", (_req, res) => {
    return res.status(200).json({ message: "ok" }).end()
  })

  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
  })

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received: closing HTTP server and queues")
    await closeWorkers()
    process.exit(0)
  })

  process.on("SIGINT", async () => {
    console.log("SIGINT signal received: closing HTTP server and queues")
    await closeWorkers()
    process.exit(0)
  })
}

const app = express()
load(app)

export default app
