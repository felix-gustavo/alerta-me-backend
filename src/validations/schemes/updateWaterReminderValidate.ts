import { body } from 'express-validator'
import { createWaterReminderValidateScheme } from './createWaterReminderValidate'

const updateWaterReminderValidateScheme = [
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Campo active precisa ser um booleano (true, false)'),
  createWaterReminderValidateScheme.map((check) => check.optional()),
]

export { updateWaterReminderValidateScheme }
