import { param } from 'express-validator'

const deleteReminderValidate = [
  param('id').notEmpty().withMessage('Campo id é obrigatório'),
]

export { deleteReminderValidate }
