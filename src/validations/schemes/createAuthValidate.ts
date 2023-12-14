import { body } from 'express-validator'

const createAuthValidateScheme = [
  body('idToken').notEmpty().withMessage('Campo idToken é obrigatório'),
]

export { createAuthValidateScheme }
