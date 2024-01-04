import { NextFunction, Response, Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { UsersController } from '../../controllers/usersController'
import { getUserByEmailValidateScheme } from '../../validations/schemes/getUserByEmailValidate'
import { getUserByIdValidateScheme } from '../../validations/schemes/getUserByIdValidate'
import { createUserValidateScheme } from '../../validations/schemes/createUserValidate'
import {
  CustomRequest,
  decodeFirebaseTokenMiddleware,
  decodeAmazonTokenMiddleware,
} from '../../middlewares/decodeTokenMiddleware'
import { deleteValidateScheme } from '../../validations/schemes/deleteValidate'

class UserRoute {
  constructor(private readonly controller: UsersController) {}

  routes = (): Router => {
    const authRoute = Router()

    authRoute.post(
      '/',
      createUserValidateScheme,
      handleValidationErrors,
      this.controller.create
    )

    authRoute.get(
      '/id/:id',
      getUserByIdValidateScheme,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.getById
    )

    authRoute.get(
      '/email/:email',
      getUserByEmailValidateScheme,
      handleValidationErrors,
      (req: CustomRequest, res: Response, next: NextFunction) => {
        const isElderly = (req.query.isElderly as string | undefined) === 'true'

        return isElderly
          ? decodeAmazonTokenMiddleware(req, res, next)
          : decodeFirebaseTokenMiddleware(req, res, next)
      },
      (req: CustomRequest, res: Response) => res.json(req.user)
    )

    authRoute.get(
      '/',
      (req: CustomRequest, res: Response, next: NextFunction) => {
        const isElderly = (req.query.isElderly as string | undefined) === 'true'

        return isElderly
          ? decodeAmazonTokenMiddleware(req, res, next)
          : decodeFirebaseTokenMiddleware(req, res, next)
      },
      (req: CustomRequest, res: Response) => res.json(req.user)
    )

    authRoute.delete('/', decodeFirebaseTokenMiddleware, this.controller.delete)

    authRoute.delete(
      '/elderly',
      deleteValidateScheme,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.deleteElderly
    )

    return authRoute
  }
}

export { UserRoute }
