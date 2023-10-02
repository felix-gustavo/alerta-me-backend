import { body } from 'express-validator'

const updateAuthorizationValidateScheme = [
  body('id').notEmpty().withMessage('Campo id é obrigatório'),
]

export { updateAuthorizationValidateScheme }
