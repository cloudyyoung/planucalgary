import { Router } from "express"

import { createFaculty, deleteFaculty, getFaculty, listFaculties, updateFaculty } from "./controllers"
import { admin } from "../../middlewares/admin"
import { IdInputSchema, zod } from "../../middlewares"
import { FacultyCreateSchema, FacultyUpdateSchema } from "../../zod"

const router = Router()
router.get("/", listFaculties)
router.get("/:id", zod({ params: IdInputSchema }), getFaculty)
router.post("/", admin(), zod({ body: FacultyCreateSchema }), createFaculty)
router.put("/:id", admin(), zod({ params: IdInputSchema, body: FacultyUpdateSchema }), updateFaculty)
router.delete("/:id", admin(), zod({ params: IdInputSchema }), deleteFaculty)

export default router
export { router }
