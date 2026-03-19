import { Router } from "express"

import { createSubject, deleteSubject, getSubject, listSubjects, updateSubject } from "./controllers"
import { admin } from "../../middlewares/admin"
import { zod } from "../../middlewares"
import { SubjectCreateBodySchema, SubjectDeleteParamsSchema, SubjectGetParamsSchema, SubjectUpdateBodySchema, SubjectUpdateParamsSchema, } from "@planucalgary/shared"

const router = Router()
router.get("/", listSubjects)
router.get("/:id", zod({ params: SubjectGetParamsSchema }), getSubject)
router.post("/", admin(), zod({ body: SubjectCreateBodySchema }), createSubject)
router.put("/:id", admin(), zod({ params: SubjectUpdateParamsSchema, body: SubjectUpdateBodySchema }), updateSubject)
router.delete("/:id", admin(), zod({ params: SubjectDeleteParamsSchema }), deleteSubject)

export default router
export { router }
