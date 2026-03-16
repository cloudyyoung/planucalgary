import { Router } from "express";

import {
  createRequisiteRule,
  deleteRequisiteRule,
  getRequisiteRule,
  listRequisiteRules,
  updateRequisiteRule,
  buildRequisiteRulesRelations,
} from "./controllers";
import { admin } from "../../middlewares/admin";
import { zod } from "../../middlewares";
import {
  RequisiteRuleCreateBodySchema,
  RequisiteRuleDeleteParamsSchema,
  RequisiteRuleGetParamsSchema,
  RequisiteRuleUpdateBodySchema,
  RequisiteRuleUpdateParamsSchema,
} from "@planucalgary/shared";

const router = Router();
router.get("/", listRequisiteRules);
router.get("/:id", zod({ params: RequisiteRuleGetParamsSchema }), getRequisiteRule);
router.post("/", admin(), zod({ body: RequisiteRuleCreateBodySchema }), createRequisiteRule);
router.put("/:id", admin(), zod({ params: RequisiteRuleUpdateParamsSchema, body: RequisiteRuleUpdateBodySchema }), updateRequisiteRule);
router.delete("/:id", admin(), zod({ params: RequisiteRuleDeleteParamsSchema }), deleteRequisiteRule);
router.post("/build", admin(), zod({}), buildRequisiteRulesRelations);

export default router;
export { router };
