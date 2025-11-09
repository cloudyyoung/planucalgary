import { Router } from "express"

import { signin } from "./controllers/signin"
import { signup } from "./controllers/signup"
import { zod } from "../../middlewares"
import { SignInInputSchema, SignUpInputSchema } from "./validators"

const router = Router()

router.post("/signin", zod({ body: SignInInputSchema }), signin)
router.post("/signup", zod({ body: SignUpInputSchema }), signup)

export default router
export { router }
