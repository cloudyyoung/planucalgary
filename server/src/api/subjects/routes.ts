import { Router } from "express"
import { SubjectCreateSchema, SubjectUpdateSchema } from "@planucalgary/shared"

import { createSubject, getSubject, listSubjects, updateSubject } from "./controllers"
import { admin } from "../../middlewares/admin"
import { IdInputSchema, zod } from "../../middlewares"

const router = Router()
router.get("/", listSubjects)
router.get("/:id", zod({ params: IdInputSchema }), getSubject)
router.post("/", admin(), zod({ body: SubjectCreateSchema }), createSubject)
router.put("/:id", admin(), zod({ params: IdInputSchema, body: SubjectUpdateSchema }), updateSubject)

export default router
export { router }
