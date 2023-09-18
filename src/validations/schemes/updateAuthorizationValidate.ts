import { body } from 'express-validator'

const updateAuthorizationValidateScheme = [
  body('id').escape().notEmpty().withMessage('Campo id é obrigatório'),
]

export { updateAuthorizationValidateScheme }
