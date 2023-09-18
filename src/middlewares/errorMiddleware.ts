import { NextFunction, Request, Response } from 'express'
import { CustomError } from '../exceptions/customError'

export const errorMiddleware = (
  error: Error & Partial<CustomError>,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.code ?? 500
  const message = error.code ? error.message : 'Erro interno do servidor'
  return res.status(statusCode).json(message)
}
