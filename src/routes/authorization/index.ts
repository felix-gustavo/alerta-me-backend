import { Router } from 'express'
import { AuthorizationController } from '../../controllers/authorizationController'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { createAuthorizationValidateScheme } from '../../validations/schemes/createAuthorizationValidate'
import { updateAuthorizationValidateScheme } from '../../validations/schemes/updateAuthorizationValidate'
import {
  decodeAmazonTokenMiddleware,
  decodeFirebaseTokenMiddleware,
} from '../../middlewares/decodeTokenMiddleware'

class AuthorizationRoute {
  constructor(private readonly controller: AuthorizationController) {}

  routes = (): Router => {
    const authorizationRoute = Router()

    authorizationRoute.post(
      '/',
      createAuthorizationValidateScheme,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.create
    )

    authorizationRoute.get(
      '/user',
      decodeFirebaseTokenMiddleware,
      this.controller.getAuthorizationByUser
    )

    authorizationRoute.get(
      '/elderly',
      decodeAmazonTokenMiddleware,
      this.controller.getAuthorizationByElderly
    )

    authorizationRoute.put(
      '/elderly/approve',
      updateAuthorizationValidateScheme,
      handleValidationErrors,
      decodeAmazonTokenMiddleware,
      this.controller.approvedAuthorizationElderly
    )

    authorizationRoute.delete(
      '/',
      decodeFirebaseTokenMiddleware,
      this.controller.deleteAuthorization
    )

    return authorizationRoute
  }
}

export { AuthorizationRoute }
