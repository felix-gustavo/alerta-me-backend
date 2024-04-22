import { param } from 'express-validator'

const idParamValidateScheme = [
  param('id').notEmpty().withMessage('Campo id é obrigatório'),
]

export { idParamValidateScheme }
