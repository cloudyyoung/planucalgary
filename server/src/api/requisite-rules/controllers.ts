import {
  RequisiteRuleCreateHandler,
  RequisiteRuleDeleteHandler,
  RequisiteRuleGetHandler,
  RequisiteRuleListHandler,
  RequisiteRuleUpdateHandler,
  getSortings,
} from "@planucalgary/shared";
import { RequisiteRuleAlreadyExistsError, RequisiteRuleNotFoundError } from "./errors";

export const listRequisiteRules: RequisiteRuleListHandler = async (req, res) => {
  const { id, requisite_id, parent_rule_id, name, description, notes, condition, grade, grade_type, sorting } = req.query;
  const whereConditions = {
    ...(id && { id: { contains: id } }),
    ...(requisite_id && { requisite_id: { contains: requisite_id } }),
    ...(parent_rule_id && { parent_rule_id: { contains: parent_rule_id } }),
    ...(name && { name: { contains: name } }),
    ...(description && { description: { contains: description } }),
    ...(notes && { notes: { contains: notes } }),
    ...(condition && { condition: { contains: condition } }),
    ...(grade && { grade: { contains: grade } }),
    ...(grade_type && { grade_type: { contains: grade_type } }),
  };
  const [requisiteRules, total] = await Promise.all([
    req.prisma.requisiteRule.findMany({
      where: whereConditions,
      orderBy: getSortings(sorting),
      skip: req.pagination.offset,
      take: req.pagination.limit,
    }),
    req.prisma.requisiteRule.count({
      where: whereConditions,
    }),
  ]);

  return res.paginate(requisiteRules, total);
};

export const getRequisiteRule: RequisiteRuleGetHandler = async (req, res) => {
  const { id } = req.params;
  const requisiteRule = await req.prisma.requisiteRule.findUnique({
    where: { id },
  });

  if (!requisiteRule) {
    throw new RequisiteRuleNotFoundError();
  }

  return res.json(requisiteRule);
};

export const createRequisiteRule: RequisiteRuleCreateHandler = async (req, res) => {
  const existing = await req.prisma.requisiteRule.findUnique({
    where: { id: req.body.id },
  });

  if (existing) {
    throw new RequisiteRuleAlreadyExistsError();
  }

  const requisiteRule = await req.prisma.requisiteRule.create({
    data: {
      ...req.body,
      raw_json: req.body.raw_json as any,
    },
  });

  return res.json(requisiteRule);
};

export const updateRequisiteRule: RequisiteRuleUpdateHandler = async (req, res) => {
  const existing = await req.prisma.requisiteRule.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    throw new RequisiteRuleNotFoundError();
  }

  const requisiteRule = await req.prisma.requisiteRule.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      raw_json: req.body.raw_json as any,
    },
  });

  return res.json(requisiteRule);
};

export const deleteRequisiteRule: RequisiteRuleDeleteHandler = async (req, res) => {
  const existing = await req.prisma.requisiteRule.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    throw new RequisiteRuleNotFoundError();
  }

  await req.prisma.requisiteRule.delete({
    where: { id: req.params.id },
  });

  return res.sendStatus(204);
};
