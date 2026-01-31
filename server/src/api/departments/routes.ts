import { Router } from "express"

import { createDepartment, deleteDepartment, getDepartment, listDepartments, updateDepartment, crawlDepartments } from "./controllers"
import { admin } from "../../middlewares/admin"
import { zod } from "../../middlewares"
import { DepartmentCreateBodySchema, DepartmentDeleteParamsSchema, DepartmentGetParamsSchema, DepartmentUpdateBodySchema, DepartmentUpdateParamsSchema } from "@planucalgary/shared"

const router = Router()

router.get("/", listDepartments)
router.get("/:id", zod({ params: DepartmentGetParamsSchema }), getDepartment)
router.post("/", admin(), zod({ body: DepartmentCreateBodySchema }), createDepartment)
router.put("/:id", admin(), zod({ params: DepartmentUpdateParamsSchema, body: DepartmentUpdateBodySchema }), updateDepartment)
router.delete("/:id", admin(), zod({ params: DepartmentDeleteParamsSchema }), deleteDepartment)

router.post("/crawl", admin(), crawlDepartments)

export default router
export { router }
