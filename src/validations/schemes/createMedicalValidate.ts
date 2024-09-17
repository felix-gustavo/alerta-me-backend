import { body } from 'express-validator'

const createMedicalValidate = [
  body('medic_name')
    .isLength({ min: 3, max: 60 })
    .withMessage(
      'Campo medic_name deve ter pelo menos 3 e no máximo 60 caracteres'
    ),
  body('specialty')
    .isLength({ min: 3, max: 43 })
    .withMessage(
      'Campo specialty deve ter pelo menos 3 e no máximo 43 caracteres'
    ),
  body('datetime')
    .matches(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
    )
    .withMessage('Campo datetime precisa ser uma data (YYYY-MM-DDTHH:mm:ss)'),
  body('address')
    .isLength({ min: 3, max: 130 })
    .withMessage(
      'Campo address deve ter pelo menos 3 e no máximo 130 caracteres'
    ),
  body('active')
    .isBoolean()
    .withMessage('Campo active deve ser um booleano (true, false)'),
]

export { createMedicalValidate }
