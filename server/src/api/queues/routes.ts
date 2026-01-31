import { Router } from "express"
import { getQueueStatus } from "./controllers"

const router = Router()
router.get("/catalog", getQueueStatus)

export default router
export { router }
