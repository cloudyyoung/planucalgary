export class FacultyNotFoundError extends Error {
    constructor() {
        super()
        this.name = "FacultyNotFoundError"
        this.message = "The requested faculty was not found."
    }
}

export class FacultyAlreadyExistsError extends Error {
    constructor(existingId: string) {
        super()
        this.name = "FacultyAlreadyExistsError"
        this.message = "A faculty already exists."
        this.stack = existingId
    }
}
