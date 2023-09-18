import { param } from 'express-validator'

const getUserByIdValidateScheme = [
  param('id').escape().notEmpty().withMessage('Campo id é obrigatório'),
]

export { getUserByIdValidateScheme }
