import { Router } from 'express'
import { AuthController } from '../../controllers/authController'
import { createAuthValidateScheme } from '../../validations/schemes/createAuthValidate'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { refreshTokenValidateScheme } from '../../validations/schemes/refreshTokenValidate'
import { decodeAmazonTokenMiddleware } from '../../middlewares/decodeTokenMiddleware'

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

    authRoute.post('/sign-in-elderly', this.controller.signInElderly)
    authRoute.post(
      '/refresh-token',
      refreshTokenValidateScheme,
      handleValidationErrors,
      this.controller.refreshToken
    )
    authRoute.post(
      '/refresh-token-null',
      decodeAmazonTokenMiddleware,
      this.controller.refreshTokenNull
    )

    return authRoute
  }
}

export { AuthRoute }
