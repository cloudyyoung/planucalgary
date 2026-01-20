export class RequisiteNotFoundError extends Error {
    constructor() {
        super()
        this.name = "RequisiteNotFoundError"
        this.message = "The requested requisite was not found."
    }
}

export class InvalidSyncDestinationError extends Error {
    constructor() {
        super()
        this.name = "InvalidSyncDestinationError"
        this.message = "The provided sync destination is invalid."
    }
}