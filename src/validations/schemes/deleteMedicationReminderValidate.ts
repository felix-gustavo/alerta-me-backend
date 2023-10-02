import { param } from 'express-validator'

const deleteMedicationReminderValidate = [
  param('id').notEmpty().withMessage('Campo id é obrigatório'),
]

export { deleteMedicationReminderValidate }
