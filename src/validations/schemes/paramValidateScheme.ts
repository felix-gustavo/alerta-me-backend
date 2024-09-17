import { param } from 'express-validator'

const paramValidateScheme = (field: string) => [
  param(field).notEmpty().withMessage(`Campo ${field} é obrigatório`),
  // param('id').notEmpty().withMessage('Campo id é obrigatório'),
]

export { paramValidateScheme }
