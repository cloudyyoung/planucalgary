import { Router } from "express"

import { admin } from "../../middlewares/admin"
import { IdInputSchema, zod } from "../../middlewares"
import {
  generateRequisiteChoices,
  getRequisite,
  listRequisites,
  syncRequisites,
  updateRequisite,
  getFineTuneJsons,
} from "./controllers"
import { RequisiteListSchema, RequisitesSyncSchema } from "./validators"

const router = Router()
router.get("/", admin(), zod({ query: RequisiteListSchema }), listRequisites)
router.post("/sync", admin(), zod({ body: RequisitesSyncSchema }), syncRequisites)
router.get("/fine-tune", admin(), getFineTuneJsons)

router.get("/:id", admin(), zod({ params: IdInputSchema }), getRequisite)
router.post("/:id", admin(), zod({ params: IdInputSchema }), generateRequisiteChoices)
router.put("/:id", admin(), zod({ params: IdInputSchema }), updateRequisite)

export default router
export { router }
