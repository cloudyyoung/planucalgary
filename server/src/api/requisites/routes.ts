import { Router } from "express"
import { RequisiteGenerateChoicesReqParamsSchema, RequisiteGetReqParamsSchema, RequisiteListReqQuerySchema, RequisitesSyncReqBodySchema } from "@planucalgary/shared"

import { admin } from "../../middlewares/admin"
import { zod } from "../../middlewares"
import {
  generateRequisiteChoices,
  getRequisite,
  listRequisites,
  syncRequisites,
  updateRequisite,
} from "./controllers"

const router = Router()

router.get("/", admin(), zod({ query: RequisiteListReqQuerySchema }), listRequisites)
router.get("/:id", admin(), zod({ params: RequisiteGetReqParamsSchema }), getRequisite)
router.put("/:id", admin(), zod({ params: RequisiteGetReqParamsSchema }), updateRequisite)

router.post("/sync", admin(), zod({ body: RequisitesSyncReqBodySchema }), syncRequisites)
router.post("/:id", admin(), zod({ params: RequisiteGenerateChoicesReqParamsSchema }), generateRequisiteChoices)

export default router
export { router }
