import { Router } from "express"

import { createCourseSet, deleteCourseSet, getCourseSet, listCourseSets, updateCourseSet, crawlCourseSets } from "./controllers"
import { admin } from "../../middlewares/admin"
import { zod } from "../../middlewares"
import { CourseSetCreateBodySchema, CourseSetDeleteParamsSchema, CourseSetGetParamsSchema, CourseSetUpdateBodySchema, CourseSetUpdateParamsSchema, } from "@planucalgary/shared"

const router = Router()

router.get("/", listCourseSets)
router.get("/:id", zod({ params: CourseSetGetParamsSchema }), getCourseSet)
router.post("/", admin(), zod({ body: CourseSetCreateBodySchema }), createCourseSet)
router.put("/:id", admin(), zod({ params: CourseSetUpdateParamsSchema, body: CourseSetUpdateBodySchema }), updateCourseSet)
router.delete("/:id", admin(), zod({ params: CourseSetDeleteParamsSchema }), deleteCourseSet)

router.post("/crawl", admin(), zod({}), crawlCourseSets)

export default router
export { router }
