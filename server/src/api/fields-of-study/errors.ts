export class FieldsOfStudyNotFoundError extends Error {
    constructor() {
        super()
        this.name = "FieldsOfStudyNotFoundError"
        this.message = "The requested field of study was not found."
    }
}

export class FieldsOfStudyAlreadyExistsError extends Error {
    constructor() {
        super()
        this.name = "FieldsOfStudyAlreadyExistsError"
        this.message = "A field of study already exists."
    }
}
