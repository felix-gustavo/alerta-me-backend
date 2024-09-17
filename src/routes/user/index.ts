import { NextFunction, Response, Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { UsersController } from '../../controllers/usersController'
import { paramValidateScheme } from '../../validations/schemes/paramValidateScheme'
import {
  CustomRequest,
  decodeFirebaseTokenMiddleware,
  decodeAmazonTokenMiddleware,
} from '../../middlewares/decodeTokenMiddleware'

class UserRoute {
  constructor(private readonly controller: UsersController) {}

  routes = (): Router => {
    const userRoute = Router()

    userRoute.post(
      '/elderly',
      decodeAmazonTokenMiddleware,
      this.controller.createElderly
    )

    userRoute.get(
      '/elderly/id/:id',
      paramValidateScheme('id'),
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.getElderlyById
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
      this.controller.getById
    )

    userRoute.get(
      '/',
      (req: CustomRequest, res: Response, next: NextFunction) => {
        const isElderly = (req.query.isElderly as string | undefined) === 'true'

        return isElderly
          ? decodeAmazonTokenMiddleware(req, res, next)
          : decodeFirebaseTokenMiddleware(req, res, next)
      },
      this.controller.get
    )

    userRoute.delete('/', decodeFirebaseTokenMiddleware, this.controller.delete)

    userRoute.delete(
      '/elderly/:id',
      paramValidateScheme('id'),
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.deleteElderly
    )

    return userRoute
  }
}

export { UserRoute }
