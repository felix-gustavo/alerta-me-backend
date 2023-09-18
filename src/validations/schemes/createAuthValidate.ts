import { body } from 'express-validator'

const createAuthValidateScheme = [
  body('idToken').escape().notEmpty().withMessage('Campo token é obrigatório'),
]

export { createAuthValidateScheme }
