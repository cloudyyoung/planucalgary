export class DepartmentNotFoundError extends Error {
    constructor() {
        super()
        this.name = "DepartmentNotFoundError"
        this.message = "The requested department was not found."
    }
}

export class DepartmentAlreadyExistsError extends Error {
    constructor() {
        super()
        this.name = "DepartmentAlreadyExistsError"
        this.message = "A department already exists."
    }
}
