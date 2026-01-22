import { Router } from "express"

import { createFaculty, deleteFaculty, getFaculty, listFaculties, updateFaculty } from "./controllers"
import { admin } from "../../middlewares/admin"
import { zod } from "../../middlewares"
import { FacultyCreateBodySchema, FacultyDeleteParamsSchema, FacultyGetParamsSchema, FacultyUpdateBodySchema, FacultyUpdateParamsSchema, } from "@planucalgary/shared"

const router = Router()
router.get("/", listFaculties)
router.get("/:id", zod({ params: FacultyGetParamsSchema }), getFaculty)
router.post("/", admin(), zod({ body: FacultyCreateBodySchema }), createFaculty)
router.put("/:id", admin(), zod({ params: FacultyUpdateParamsSchema, body: FacultyUpdateBodySchema }), updateFaculty)
router.delete("/:id", admin(), zod({ params: FacultyDeleteParamsSchema }), deleteFaculty)

export default router
export { router }
