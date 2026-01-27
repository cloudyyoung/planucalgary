export class ProgramNotFoundError extends Error {
    constructor() {
        super()
        this.name = "ProgramNotFoundError"
        this.message = "The requested program was not found."
    }
}

export class ProgramAlreadyExistsError extends Error {
    constructor(existingId: string) {
        super()
        this.name = "ProgramAlreadyExistsError"
        this.message = "A program already exists."
        this.stack = existingId
    }
}
