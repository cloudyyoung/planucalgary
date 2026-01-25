export class CourseNotFoundError extends Error {
  constructor() {
    super()
    this.name = "CourseNotFoundError"
    this.message = "The requested course was not found."
  }
}

export class CourseAlreadyExistsError extends Error {
  constructor(existing_id: string) {
    super()
    this.name = "CourseAlreadyExistsError"
    this.message = "A course with the given CID already exists."
    this.stack = existing_id
  }
}