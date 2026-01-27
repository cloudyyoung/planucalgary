export class DepartmentNotFoundError extends Error {
    constructor() {
        super()
        this.name = "DepartmentNotFoundError"
        this.message = "The requested department was not found."
    }
}

export class DepartmentAlreadyExistsError extends Error {
    constructor(existingId: string) {
        super()
        this.name = "DepartmentAlreadyExistsError"
        this.message = "A department already exists."
        this.stack = existingId
    }
}
