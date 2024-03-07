import { body } from 'express-validator'

const createUserValidateScheme = [
  body('id').optional().isString().withMessage('Campo id deve ser String'),
  body('name')
    .isLength({ min: 3, max: 60 })
    .withMessage('Campo name deve ter pelo menos 3 e no máximo 60 caracteres'),
  body('email').isEmail().withMessage('Campo email deve ser um email'),
  body('is_elderly')
    .isBoolean()
    .withMessage('Campo is_elderly deve ser um booleano (true, false)'),
]

export { createUserValidateScheme }
