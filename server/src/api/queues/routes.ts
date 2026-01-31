import { Router } from "express"
import { catalogQueue } from "@/queue"
import { getQueueStatus } from "./controllers"

export const router: Router = Router()


router.get(`/${catalogQueue.name}`, getQueueStatus)
