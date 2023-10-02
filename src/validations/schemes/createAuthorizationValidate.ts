import { body } from 'express-validator'

const createAuthorizationValidateScheme = [
  body('elderly').notEmpty().withMessage('Campo elderly é obrigatório'),
]

export { createAuthorizationValidateScheme }
