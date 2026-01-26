import { Router } from "express"

import { createFieldsOfStudy, deleteFieldsOfStudy, getFieldsOfStudy, listFieldsOfStudy, updateFieldsOfStudy } from "./controllers"
import { admin } from "../../middlewares/admin"
import { zod } from "../../middlewares"
import { FieldsOfStudyCreateBodySchema, FieldsOfStudyDeleteParamsSchema, FieldsOfStudyGetParamsSchema, FieldsOfStudyUpdateBodySchema, FieldsOfStudyUpdateParamsSchema, } from "@planucalgary/shared"

const router = Router()
router.get("/", listFieldsOfStudy)
router.get("/:id", zod({ params: FieldsOfStudyGetParamsSchema }), getFieldsOfStudy)
router.post("/", admin(), zod({ body: FieldsOfStudyCreateBodySchema }), createFieldsOfStudy)
router.put("/:id", admin(), zod({ params: FieldsOfStudyUpdateParamsSchema, body: FieldsOfStudyUpdateBodySchema }), updateFieldsOfStudy)
router.delete("/:id", admin(), zod({ params: FieldsOfStudyDeleteParamsSchema }), deleteFieldsOfStudy)

export default router
export { router }
