import { body } from 'express-validator'
import { paramValidateScheme } from './paramValidateScheme'

const setHistoryValidateScheme = [
  ...paramValidateScheme('id'),
  body('amount')
    .notEmpty()
    .withMessage('Campo amount é obrigatório')
    .isNumeric()
    .withMessage('Campo amount precisa ser um número'),
]

export { setHistoryValidateScheme }
