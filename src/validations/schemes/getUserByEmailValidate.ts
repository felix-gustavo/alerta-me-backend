import { param, query } from 'express-validator'

const getUserByEmailValidateScheme = [
  param('email').notEmpty().withMessage('Campo email é obrigatório em params'),
  query('isElderly')
    .notEmpty()
    .withMessage('Campo isElderly é obrigatório em query')
    .isBoolean()
    .withMessage('Campo isElderly deve ser um booleano (true, false) em query'),
]

export { getUserByEmailValidateScheme }
