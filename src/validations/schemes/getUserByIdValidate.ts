import { param } from 'express-validator'

const getUserByIdValidateScheme = [
  param('id').notEmpty().withMessage('Campo id é obrigatório'),
]

export { getUserByIdValidateScheme }
