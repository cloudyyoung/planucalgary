export class InvalidCredentialsError extends Error {
  constructor() {
    super()
    this.name = "InvalidCredentialsError"
    this.message = "Invalid credentials provided for authentication."
  }
}

export class EmailExistsError extends Error {
  constructor() {
    super()
    this.name = "EmailExistsError"
    this.message = "Email already exists."
  }
}
