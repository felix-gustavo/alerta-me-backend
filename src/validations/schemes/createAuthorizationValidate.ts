import { body } from 'express-validator'

const createAuthorizationValidateScheme = [
  body('elderly')
    .escape()
    .notEmpty()
    .withMessage('Campo elderly é obrigatório'),
]

export { createAuthorizationValidateScheme }
