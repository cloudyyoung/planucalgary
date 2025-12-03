import { Router } from "express"
import { SignInInputSchema, SignUpInputSchema } from "@planucalgary/shared"

import { signin } from "./controllers/signin"
import { signup } from "./controllers/signup"
import { zod } from "../../middlewares"

const router = Router()

router.post("/signin", zod({ body: SignInInputSchema }), signin)
router.post("/signup", zod({ body: SignUpInputSchema }), signup)

export default router
export { router }
