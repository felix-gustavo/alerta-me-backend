import { body } from 'express-validator'

const updateWaterReminderValidateScheme = [
  body('start')
    .optional()
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Campo start precisa representar hora (HH:MM:SS)'),
  body('end')
    .optional()
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Campo end precisa representar hora (HH:MM:SS)'),
  body('interval')
    .optional()
    .isNumeric()
    .withMessage('Campo interval precisa sem um número'),
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Campo amount precisa sem um número'),
]

export { updateWaterReminderValidateScheme }
