import { body } from 'express-validator'

const updateWaterReminderValidateScheme = [
  body('start')
    .escape()
    .optional()
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Campo start precisa representar hora (HH:MM:SS)'),
  body('end')
    .escape()
    .optional()
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Campo end precisa representar hora (HH:MM:SS)'),
  body('interval')
    .escape()
    .optional()
    .isNumeric()
    .withMessage('Campo interval precisa sem um número'),
  body('amount')
    .escape()
    .optional()
    .isNumeric()
    .withMessage('Campo amount precisa sem um número'),
]

export { updateWaterReminderValidateScheme }
