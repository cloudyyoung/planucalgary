import { Router } from "express"

import { createProgram, deleteProgram, getProgram, listPrograms, updateProgram } from "./controllers"
import { admin } from "../../middlewares/admin"
import { IdInputSchema, zod } from "../../middlewares"
import { ProgramCreateSchema, ProgramUpdateSchema, ProgramCreateRelationsSchema, ProgramListSchema, ProgramStartTermSchema } from "@planucalgary/shared"

const router = Router()
router.get("/", zod({ query: ProgramListSchema }), listPrograms)
router.get("/:id", zod({ params: IdInputSchema }), getProgram)
router.post(
  "/",
  admin(),
  zod({ body: ProgramCreateSchema.merge(ProgramStartTermSchema).merge(ProgramCreateRelationsSchema) }),
  createProgram,
)
router.put(
  "/:id",
  admin(),
  zod({
    params: IdInputSchema,
    body: ProgramUpdateSchema.merge(ProgramStartTermSchema).merge(ProgramCreateRelationsSchema),
  }),
  updateProgram,
)
router.delete("/:id", admin(), zod({ params: IdInputSchema }), deleteProgram)

export default router
export { router }
