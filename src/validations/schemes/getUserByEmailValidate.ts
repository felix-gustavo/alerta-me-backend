import { param } from 'express-validator'

const getUserByEmailValidateScheme = [
  param('email').notEmpty().withMessage('Campo email é obrigatório'),
]

export { getUserByEmailValidateScheme }
