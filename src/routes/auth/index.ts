import { Router } from 'express'
import { AuthController } from '../../controllers/authController'
import { createAuthValidateScheme } from '../../validations/schemes/createAuthValidate'
import { handleValidationErrors } from '../../validations/handleValidationErrors'

class AuthRoute {
  constructor(private readonly controller: AuthController) {}

  routes = (): Router => {
    const authRoute = Router()
    authRoute.post(
      '/sign-in',
      createAuthValidateScheme,
      handleValidationErrors,
      this.controller.signIn
    )
    return authRoute
  }
}

export { AuthRoute }
