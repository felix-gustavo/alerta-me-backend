import {
  decodeAmazonTokenMiddleware,
  decodeFirebaseTokenMiddleware,
} from '../../middlewares/decodeTokenMiddleware.ts'
import { AuthorizationController } from '../../controllers/authorizationController.ts'
import { Router } from 'express'
import { createAuthorizationValidateScheme } from '../../validations/schemes/createAuthorizationValidate.ts'
import { handleValidationErrors } from '../../validations/handleValidationErrors.ts'
import { paramValidateScheme } from '../../validations/schemes/paramValidateScheme.ts'

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
      '/elderly/approve/:id',
      paramValidateScheme('id'),
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
