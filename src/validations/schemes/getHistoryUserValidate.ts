import { param } from 'express-validator'

const getHistoryUserValidate = [
  param('date')
    .matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
    .withMessage('Parametro date precisa ser uma data (YYYY-MM-DD)'),
]

export { getHistoryUserValidate }
