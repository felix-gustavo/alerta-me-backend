import { Router } from 'express'
import { AuthorizationController } from '../../controllers/authorizationController'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { createAuthorizationValidateScheme } from '../../validations/schemes/createAuthorizationValidate'
import { verifyTokenMiddleware } from '../../middlewares/verifyTokenMiddleware'
import { updateAuthorizationValidateScheme } from '../../validations/schemes/updateAuthorizationValidate'

class AuthorizationRoute {
  constructor(private readonly controller: AuthorizationController) {}

  routes = (): Router => {
    const authorizationRoute = Router()

    authorizationRoute.post(
      '/',
      createAuthorizationValidateScheme,
      handleValidationErrors,
      verifyTokenMiddleware,
      this.controller.create
    )

    authorizationRoute.get(
      '/user',
      verifyTokenMiddleware,
      this.controller.getAuthorizationByUser
    )

    authorizationRoute.get(
      '/elderly',
      verifyTokenMiddleware,
      this.controller.getAuthorizationByElderly
    )

    authorizationRoute.put(
      '/elderly/approve',
      updateAuthorizationValidateScheme,
      handleValidationErrors,
      verifyTokenMiddleware,
      this.controller.approvedAuthorizationElderly
    )

    return authorizationRoute
  }
}

export { AuthorizationRoute }
