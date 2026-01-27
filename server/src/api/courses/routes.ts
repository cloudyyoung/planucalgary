import { Router } from "express"
import { CourseCreateReqBodySchema, CourseListReqQuerySchema, CourseGetReqParamsSchema, CourseUpdateReqBodySchema, CourseUpdateReqParamsSchema, CourseDeleteReqParamsSchema } from "@planucalgary/shared"

import { createCourse, deleteCourse, getCourse, listCourses, updateCourse } from "./controllers"
import { admin } from "../../middlewares/admin"
import { zod } from "../../middlewares"
import { crawlCourses } from "./crawl"

const router = Router()
router.get("/", zod({ query: CourseListReqQuerySchema }), listCourses)
router.get("/:id", zod({ params: CourseGetReqParamsSchema }), getCourse)
router.post("/", admin(), zod({ body: CourseCreateReqBodySchema }), createCourse)
router.put(
  "/:id",
  admin(),
  zod({ params: CourseUpdateReqParamsSchema, body: CourseUpdateReqBodySchema }),
  updateCourse,
)
router.delete("/:id", admin(), zod({ params: CourseDeleteReqParamsSchema }), deleteCourse)

router.post("/crawl", admin(), zod({}), crawlCourses)

export default router
export { router }
