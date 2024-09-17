import { Router } from 'express'
import { decodeAmazonTokenMiddleware } from '../../middlewares/decodeTokenMiddleware'
import { body } from 'express-validator'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { ProactiveController } from '../../controllers/proactiveController'

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
      this.controller.proactiveSubAccepted
    )

    proactiveRoute.put(
      '/disabled',
      decodeAmazonTokenMiddleware,
      this.controller.proactiveSubDisabled
    )

    return proactiveRoute
  }
}
export { ProactiveRoute }
