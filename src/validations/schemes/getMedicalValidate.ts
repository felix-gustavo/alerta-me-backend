import { param } from 'express-validator'

const getMedicalValidate = [
  param('isPast')
    .isBoolean()
    .withMessage('Campo isPast deve ser um booleano (true, false)')
    .optional(),
]

export { getMedicalValidate }
