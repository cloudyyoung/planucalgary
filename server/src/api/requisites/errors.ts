export class RequisiteNotFoundError extends Error {
    constructor() {
        super()
        this.name = "RequisiteNotFoundError"
        this.message = "The requested requisite was not found."
    }
}

export class InvalidRequisiteJsonError extends Error {
    constructor() {
        super()
        this.name = "InvalidRequisiteJsonError"
        this.message = "The provided requisite JSON is invalid."
    }
}