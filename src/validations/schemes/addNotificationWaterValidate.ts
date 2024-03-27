import { body } from 'express-validator'

const AddNotificationWaterValidateScheme = [
  body('elderlyId').notEmpty().withMessage('Campo elderlyId é obrigatório'),
  body('suggested_amount')
    .notEmpty()
    .withMessage('Campo suggested_amount é obrigatório')
    .isNumeric()
    .withMessage('Campo suggested_amount precisa ser um número'),
]

export { AddNotificationWaterValidateScheme }
