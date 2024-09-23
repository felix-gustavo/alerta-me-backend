import { ProactiveController } from '../../controllers/proactiveController'
import { Router } from 'express'
import { body } from 'express-validator'
import { decodeAmazonTokenMiddleware } from '../../middlewares/decodeTokenMiddleware'
import { handleValidationErrors } from '../../validations/handleValidationErrors'

class ProactiveRoute {
  constructor(private readonly controller: ProactiveController) {}

  routes = (): Router => {
    const proactiveRoute = Router()

    proactiveRoute.put(
      '/accepted',
      [
        body('ask_user_id')
          .isString()
          .withMessage('Campo ask_user_id deve ser String'),
      ],
      handleValidationErrors,
      decodeAmazonTokenMiddleware,
      this.controller.proactiveSubAccepted,
    )

    proactiveRoute.put(
      '/disabled',
      decodeAmazonTokenMiddleware,
      this.controller.proactiveSubDisabled,
    )

    return proactiveRoute
  }
}
export { ProactiveRoute }
