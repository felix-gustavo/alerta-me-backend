import { body } from 'express-validator'

const createWaterReminderValidateScheme = [
  body('start')
    .notEmpty()
    .withMessage('Campo start é obrigatório')
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Campo start precisa representar hora (HH:MM)'),
  body('end')
    .notEmpty()
    .withMessage('Campo end é obrigatório')
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Campo end precisa representar hora (HH:MM)'),
  body('interval')
    .notEmpty()
    .withMessage('Campo interval é obrigatório')
    .isInt({ min: 5, max: 120 })
    .withMessage('Campo interval deve estar entre 5 e 120')
    .isDivisibleBy(5)
    .withMessage('Deve ser múltiplo de 5'),
  body('amount')
    .notEmpty()
    .withMessage('Campo amount é obrigatório')
    .isNumeric()
    .withMessage('Campo amount precisa ser um número'),
]

export { createWaterReminderValidateScheme }
