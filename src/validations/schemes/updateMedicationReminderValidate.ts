import { param } from 'express-validator'
import { createMedicationReminderValidateScheme } from './createMedicationReminderValidate'

const updateMedicationReminderValidate = [
  param('id').notEmpty().withMessage('Campo id é obrigatório'),
  ...createMedicationReminderValidateScheme.map((check) => check.optional()),
]

export { updateMedicationReminderValidate }
