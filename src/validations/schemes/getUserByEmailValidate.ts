import { param } from 'express-validator'

const getUserByEmailValidateScheme = [
  param('email').escape().notEmpty().withMessage('Campo email é obrigatório'),
]

export { getUserByEmailValidateScheme }
