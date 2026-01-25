export class SubjectNotFoundError extends Error {
    constructor() {
        super()
        this.name = "SubjectNotFoundError"
        this.message = "The requested subject was not found."
    }
}

export class SubjectAlreadyExistsError extends Error {
    constructor(existing_id: string) {
        super()
        this.name = "SubjectAlreadyExistsError"
        this.message = "A subject already exists."
        this.stack = existing_id
    }
}
