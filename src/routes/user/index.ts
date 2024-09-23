import {
  CustomRequest,
  decodeAmazonTokenMiddleware,
  decodeFirebaseTokenMiddleware,
} from '../../middlewares/decodeTokenMiddleware'
import { NextFunction, Response, Router } from 'express'
import { UsersController } from '../../controllers/usersController'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { paramValidateScheme } from '../../validations/schemes/paramValidateScheme'

class UserRoute {
  constructor(private readonly controller: UsersController) {}

  routes = (): Router => {
    const userRoute = Router()

    userRoute.post(
      '/elderly',
      decodeAmazonTokenMiddleware,
      this.controller.createElderly,
    )

    userRoute.get(
      '/elderly/id/:id',
      paramValidateScheme('id'),
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.getElderlyById,
    )

    userRoute.get(
      '/id/:id',
      paramValidateScheme('id'),
      handleValidationErrors,
      (req: CustomRequest, res: Response, next: NextFunction) => {
        const isElderly = (req.query.isElderly as string | undefined) === 'true'

        return isElderly
          ? decodeAmazonTokenMiddleware(req, res, next)
          : decodeFirebaseTokenMiddleware(req, res, next)
      },
      this.controller.getById,
    )

    userRoute.get(
      '/',
      (req: CustomRequest, res: Response, next: NextFunction) => {
        const isElderly = (req.query.isElderly as string | undefined) === 'true'

        return isElderly
          ? decodeAmazonTokenMiddleware(req, res, next)
          : decodeFirebaseTokenMiddleware(req, res, next)
      },
      this.controller.get,
    )

    userRoute.delete('/', decodeFirebaseTokenMiddleware, this.controller.delete)

    userRoute.delete(
      '/elderly/:id',
      paramValidateScheme('id'),
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.deleteElderly,
    )

    return userRoute
  }
}

export { UserRoute }
