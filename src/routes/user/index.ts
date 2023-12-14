import { Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { UsersController } from '../../controllers/usersController'
import { getUserByEmailValidateScheme } from '../../validations/schemes/getUserByEmailValidate'
import { getUserByIdValidateScheme } from '../../validations/schemes/getUserByIdValidate'
import { verifyTokenMiddleware } from '../../middlewares/verifyTokenMiddleware'
import { createUserValidateScheme } from '../../validations/schemes/createUserValidate'

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
      verifyTokenMiddleware,
      this.controller.getById
    )

    authRoute.get(
      '/email/:email',
      getUserByEmailValidateScheme,
      handleValidationErrors,
      verifyTokenMiddleware,
      this.controller.getByEmail
    )

    authRoute.get(
      '/is-elderly/:email',
      getUserByEmailValidateScheme,
      handleValidationErrors,
      verifyTokenMiddleware,
      this.controller.isElderly
    )

    return authRoute
  }
}

export { UserRoute }
