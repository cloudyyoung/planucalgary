import { Router } from "express"

import { createCourseSet, deleteCourseSet, getCourseSet, listCourseSets, updateCourseSet } from "./controllers"
import { admin } from "../../middlewares/admin"
import { IdInputSchema, zod } from "../../middlewares"
import { CourseSetCreateSchema, CourseSetUpdateSchema } from "@planucalgary/shared"

const router = Router()
router.get("/", listCourseSets)
router.get("/:id", zod({ params: IdInputSchema }), getCourseSet)
router.post("/", admin(), zod({ body: CourseSetCreateSchema }), createCourseSet)
router.put("/:id", admin(), zod({ params: IdInputSchema, body: CourseSetUpdateSchema }), updateCourseSet)
router.delete("/:id", admin(), zod({ params: IdInputSchema }), deleteCourseSet)

export default router
export { router }
