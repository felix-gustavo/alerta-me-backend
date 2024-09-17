import { Request, Response } from 'express'
import { CustomError } from '../exceptions/customError.ts'

export const errorMiddleware = (
  error: CustomError,
  _req: Request,
  res: Response
) => {
  const statusCode = error.code ?? 500
  const message = error.code ? error.message : 'Erro interno do servidor'
  return res.status(statusCode).json(message)
}
