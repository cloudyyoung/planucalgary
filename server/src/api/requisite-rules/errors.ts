export class RequisiteRuleNotFoundError extends Error {
  constructor() {
    super();
    this.name = "RequisiteRuleNotFoundError";
    this.message = "The requested requisite rule was not found.";
  }
}

export class RequisiteRuleAlreadyExistsError extends Error {
  constructor() {
    super();
    this.name = "RequisiteRuleAlreadyExistsError";
    this.message = "A requisite rule already exists.";
  }
}
