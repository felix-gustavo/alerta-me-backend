import { body } from 'express-validator'

const createWaterReminderValidateScheme = [
  body('start')
    .notEmpty()
    .withMessage('Campo start é obrigatório')
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Campo start precisa representar hora (HH:MM:SS)'),
  body('end')
    .notEmpty()
    .withMessage('Campo end é obrigatório')
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Campo end precisa representar hora (HH:MM:SS)'),
  body('interval')
    .notEmpty()
    .withMessage('Campo interval é obrigatório')
    .isNumeric()
    .withMessage('Campo interval precisa sem um número'),
  body('amount')
    .notEmpty()
    .withMessage('Campo amount é obrigatório')
    .isNumeric()
    .withMessage('Campo amount precisa sem um número'),
]

export { createWaterReminderValidateScheme }
