import { body } from 'express-validator'

const deleteValidateScheme = [
  body('id').notEmpty().withMessage('Campo id é obrigatório'),
]

export { deleteValidateScheme }
