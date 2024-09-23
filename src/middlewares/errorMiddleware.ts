import { NextFunction, Request, Response } from 'express'
import { CustomError } from '../exceptions/customError'

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof CustomError) {
    const { code, message } = err
    return res.status(code).json(message)
  }

  return res.status(500).json('Erro interno do servidor')
}
