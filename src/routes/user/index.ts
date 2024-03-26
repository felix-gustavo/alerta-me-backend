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
import { body } from 'express-validator'

class UserRoute {
  constructor(private readonly controller: UsersController) {}

  routes = (): Router => {
    const userRoute = Router()

    userRoute.post(
      '/',
      createUserValidateScheme,
      handleValidationErrors,
      this.controller.create
    )

    userRoute.post(
      '/elderly',
      decodeAmazonTokenMiddleware,
      this.controller.createElderly
    )

    userRoute.get(
      '/id/:id',
      getUserByIdValidateScheme,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.getById
    )

    userRoute.get(
      '/email/:email',
      getUserByEmailValidateScheme,
      handleValidationErrors,
      (req: CustomRequest, res: Response, next: NextFunction) => {
        const isElderly = (req.query.isElderly as string | undefined) === 'true'

        return isElderly
          ? decodeAmazonTokenMiddleware(req, res, next)
          : decodeFirebaseTokenMiddleware(req, res, next)
      },
      (req: CustomRequest, res: Response) => {
        req.params.email = req.user?.email as string
        req.query.isElderly = 'true'
        return this.controller.getByEmailAndType(req, res)
      }
    )

    userRoute.get(
      '/',
      (req: CustomRequest, res: Response, next: NextFunction) => {
        const isElderly = (req.query.isElderly as string | undefined) === 'true'

        return isElderly
          ? decodeAmazonTokenMiddleware(req, res, next)
          : decodeFirebaseTokenMiddleware(req, res, next)
      },
      (req: CustomRequest, res: Response) => {
        req.params.email = req.user?.email as string
        req.query.isElderly = 'true'
        return this.controller.getByEmailAndType(req, res)
      }
    )

    userRoute.put(
      '/proactiveSubAccepted',
      [
        body('ask_user_id')
          .isString()
          .withMessage('Campo ask_user_id deve ser String'),
      ],
      handleValidationErrors,
      decodeAmazonTokenMiddleware,
      this.controller.proactiveSubAccepted
    )

    userRoute.put(
      '/proactiveSubDisabled',
      decodeAmazonTokenMiddleware,
      this.controller.proactiveSubDisabled
    )

    userRoute.delete('/', decodeFirebaseTokenMiddleware, this.controller.delete)

    userRoute.delete(
      '/elderly',
      deleteValidateScheme,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.deleteElderly
    )

    return userRoute
  }
}

export { UserRoute }
