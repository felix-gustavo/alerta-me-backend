import { Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { UserController } from '../../controllers/userController'
import { getUserByEmailValidateScheme } from '../../validations/schemes/getUserByEmailValidate'
import { getUserByIdValidateScheme } from '../../validations/schemes/getUserByIdValidate'

class UserRoute {
  constructor(private readonly controller: UserController) {}

  routes = (): Router => {
    const authRoute = Router()

    authRoute.get('/id/:id', getUserByIdValidateScheme, this.controller.getById)

    authRoute.get(
      '/email/:email',
      getUserByEmailValidateScheme,
      handleValidationErrors,
      this.controller.getByEmail
    )

    authRoute.get(
      '/is-elderly/:email',
      getUserByEmailValidateScheme,
      handleValidationErrors,
      this.controller.isElderly
    )

    return authRoute
  }
}

export { UserRoute }
