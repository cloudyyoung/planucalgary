import { Router } from "express"

import { createProgram, deleteProgram, getProgram, listPrograms, updateProgram } from "./controllers"
import { admin } from "../../middlewares/admin"
import { zod } from "../../middlewares"
import { ProgramCreateBodySchema, ProgramDeleteParamsSchema, ProgramGetParamsSchema, ProgramUpdateBodySchema, ProgramUpdateParamsSchema, ProgramListReqQuerySchema } from "@planucalgary/shared"

const router = Router()
router.get("/", zod({ query: ProgramListReqQuerySchema }), listPrograms)
router.get("/:id", zod({ params: ProgramGetParamsSchema }), getProgram)
router.post("/", admin(), zod({ body: ProgramCreateBodySchema }), createProgram)
router.put("/:id", admin(), zod({ params: ProgramUpdateParamsSchema, body: ProgramUpdateBodySchema }), updateProgram)
router.delete("/:id", admin(), zod({ params: ProgramDeleteParamsSchema }), deleteProgram)

export default router
export { router }
