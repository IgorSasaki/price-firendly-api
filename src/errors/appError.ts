class AppError extends Error {
  public readonly status: number
  public readonly name: string

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'AppError'
    this.status = status

    Error.captureStackTrace(this, this.constructor)
  }
}

export default AppError
