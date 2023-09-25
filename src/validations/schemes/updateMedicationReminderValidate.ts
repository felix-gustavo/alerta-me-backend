import { param } from 'express-validator'
import { createMedicationReminderValidateScheme } from './createMedicationReminderValidate'

const updateMedicationReminderValidate = [
  param('id').escape().notEmpty().withMessage('Campo id é obrigatório'),
  ...createMedicationReminderValidateScheme,
]

export { updateMedicationReminderValidate }
