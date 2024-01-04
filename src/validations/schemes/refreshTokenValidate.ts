import { body } from 'express-validator'

const refreshTokenValidateScheme = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Campo refreshToken é obrigatório'),
]

export { refreshTokenValidateScheme }
