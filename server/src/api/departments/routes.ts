import { Router } from "express"

import { createDepartment, deleteDepartment, getDepartment, listDepartments, updateDepartment } from "./controllers"
import { admin } from "../../middlewares/admin"
import { IdInputSchema, zod } from "../../middlewares"
import { DepartmentCreateSchema, DepartmentUpdateSchema } from "@planucalgary/shared"

const router = Router()
router.get("/", listDepartments)
router.get("/:id", zod({ params: IdInputSchema }), getDepartment)
router.post("/", admin(), zod({ body: DepartmentCreateSchema }), createDepartment)
router.put("/:id", admin(), zod({ params: IdInputSchema, body: DepartmentUpdateSchema }), updateDepartment)
router.delete("/:id", admin(), zod({ params: IdInputSchema }), deleteDepartment)

export default router
export { router }
