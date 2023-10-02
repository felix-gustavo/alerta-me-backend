import { body } from 'express-validator'

const createAuthValidateScheme = [
  body('idToken').notEmpty().withMessage('Campo token é obrigatório'),
]

export { createAuthValidateScheme }
