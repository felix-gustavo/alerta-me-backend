import { body } from 'express-validator'

const setHistoryValidateScheme = [
  body('id').notEmpty().withMessage('Campo id é obrigatório'),
  body('amount')
    .notEmpty()
    .withMessage('Campo amount é obrigatório')
    .isNumeric()
    .withMessage('Campo amount precisa ser um número'),
]

export { setHistoryValidateScheme }
