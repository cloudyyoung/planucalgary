export class CourseSetNotFoundError extends Error {
    constructor() {
        super()
        this.name = "CourseSetNotFoundError"
        this.message = "The requested course set was not found."
    }
}

export class CourseSetAlreadyExistsError extends Error {
    constructor(existing_id: string) {
        super()
        this.name = "CourseSetAlreadyExistsError"
        this.message = "A course set already exists."
        this.stack = existing_id
    }
}