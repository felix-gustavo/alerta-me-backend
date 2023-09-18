abstract class CustomError extends Error {
  constructor(message: string, readonly code: number) {
    super(message)
    this.code = code
  }
}

export { CustomError }
