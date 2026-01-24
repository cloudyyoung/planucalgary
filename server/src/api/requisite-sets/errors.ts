export class RequisiteSetNotFoundError extends Error {
    constructor() {
        super()
        this.name = "RequisiteSetNotFoundError"
        this.message = "The requested requisite set was not found."
    }
}

export class RequisiteSetAlreadyExistsError extends Error {
    constructor(existing_id: string) {
        super()
        this.name = "RequisiteSetAlreadyExistsError"
        this.message = "A requisite set already exists."
        this.stack = existing_id
    }
}
