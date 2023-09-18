import { Express, Router } from 'express'
import { AuthRoute } from '../routes/auth'
import { AuthController } from '../controllers/authController'
import { AuthService } from '../services/authService'
import { UserRoute } from '../routes/user'
import { UserController } from '../controllers/userController'
import { UsersService } from '../services/usersService/usersService'
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware'
import { AuthorizationRoute } from '../routes/authorization'
import { AuthorizationController } from '../controllers/authorizationController'
import { AuthorizationService } from '../services/authorizationService/authorizationService'
import { WaterReminderRoute } from '../routes/waterReminder'
import { WaterReminderController } from '../controllers/waterReminderController'
import { WaterReminderService } from '../services/waterReminderService/waterReminderService'
import { MedicalReminderRoute } from '../routes/medicalReminder'
import { MedicalReminderController } from '../controllers/medicalReminderController'
import { helloRoute } from '../routes/hello'
import { MedicalReminderService } from '../services/medicalReminderService/medicalReminderService'

const setup = (app: Express) => {
  const routes = Router()

  const userService = UsersService.getInstance()
  const authService = new AuthService(userService)
  const authorizationService = new AuthorizationService(userService)
  const waterReminderService = new WaterReminderService(authorizationService)
  const medicalReminderService = new MedicalReminderService(
    authorizationService
  )

  const authController = new AuthController(authService)
  const authorizationController = new AuthorizationController(
    authorizationService
  )
  const usersController = new UserController(userService)
  const waterReminderController = new WaterReminderController(
    waterReminderService
  )
  const medicalReminderController = new MedicalReminderController(
    medicalReminderService
  )

  const authRoute = new AuthRoute(authController)
  const authorizationRoute = new AuthorizationRoute(authorizationController)
  const usersRoute = new UserRoute(usersController)
  const waterReminderRoute = new WaterReminderRoute(waterReminderController)
  const medicalReminderRoute = new MedicalReminderRoute(
    medicalReminderController
  )

  routes.use('/', helloRoute)
  routes.use('/auth', authRoute.routes())
  routes.use('/authorization', authorizationRoute.routes())
  routes.use('/users', verifyTokenMiddleware, usersRoute.routes())
  routes.use(
    '/water-reminder',
    verifyTokenMiddleware,
    waterReminderRoute.routes()
  )
  routes.use(verifyTokenMiddleware, medicalReminderRoute.routes())

  app.use(routes)
}

export { setup }
