import { Router } from "express"

import { createRequisiteSet, deleteRequisiteSet, getRequisiteSet, listRequisiteSets, updateRequisiteSet, crawlRequisiteSets } from "./controllers"
import { admin } from "../../middlewares/admin"
import { zod } from "../../middlewares"
import { RequisiteSetCreateBodySchema, RequisiteSetDeleteParamsSchema, RequisiteSetGetParamsSchema, RequisiteSetUpdateBodySchema, RequisiteSetUpdateParamsSchema, } from "@planucalgary/shared"

const router = Router()
router.get("/", listRequisiteSets)
router.get("/:id", zod({ params: RequisiteSetGetParamsSchema }), getRequisiteSet)
router.post("/", admin(), zod({ body: RequisiteSetCreateBodySchema }), createRequisiteSet)
router.put("/:id", admin(), zod({ params: RequisiteSetUpdateParamsSchema, body: RequisiteSetUpdateBodySchema }), updateRequisiteSet)
router.delete("/:id", admin(), zod({ params: RequisiteSetDeleteParamsSchema }), deleteRequisiteSet)
router.post("/crawl", admin(), zod({}), crawlRequisiteSets)

export default router
export { router }
