import { Express, Router } from 'express'
import { AuthRoute } from '../routes/auth'
import { AuthController } from '../controllers/authController'
import { AuthService } from '../services/authService'
import { UserRoute } from '../routes/user'
import { UsersController } from '../controllers/usersController'
import { UsersService } from '../services/usersService/usersService'
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
import { MedicationReminderService } from '../services/medicationReminderService/medicationReminderService'
import { MedicationReminderController } from '../controllers/medicationReminderController'
import { MedicationReminderRoute } from '../routes/medicationReminder'
import { decodeFirebaseTokenMiddleware } from '../middlewares/decodeTokenMiddleware'

const setup = (app: Express) => {
  const routes = Router()

  const usersService = UsersService.getInstance()
  const authService = new AuthService(usersService)
  const authorizationService = new AuthorizationService(usersService)
  const waterReminderService = new WaterReminderService(
    authorizationService,
    usersService
  )
  const medicalReminderService = new MedicalReminderService(
    authorizationService
  )
  const medicationReminderService = new MedicationReminderService(
    authorizationService
  )

  const authController = new AuthController(authService)
  const authorizationController = new AuthorizationController(
    authorizationService
  )
  const usersController = new UsersController(usersService)
  const waterReminderController = new WaterReminderController(
    waterReminderService
  )
  const medicalReminderController = new MedicalReminderController(
    medicalReminderService
  )
  const medicationReminderController = new MedicationReminderController(
    medicationReminderService
  )

  const authRoute = new AuthRoute(authController)
  const authorizationRoute = new AuthorizationRoute(authorizationController)
  const usersRoute = new UserRoute(usersController)
  const waterReminderRoute = new WaterReminderRoute(waterReminderController)
  const medicalReminderRoute = new MedicalReminderRoute(
    medicalReminderController
  )
  const medicationReminderRoute = new MedicationReminderRoute(
    medicationReminderController
  )

  routes.use('/', helloRoute)
  routes.use('/auth', authRoute.routes())
  routes.use('/authorizations', authorizationRoute.routes())
  routes.use('/users', usersRoute.routes())
  routes.use('/water-reminders', waterReminderRoute.routes())
  routes.use(
    '/medical-reminders',
    decodeFirebaseTokenMiddleware,
    medicalReminderRoute.routes()
  )
  routes.use(
    '/medication-reminders',
    decodeFirebaseTokenMiddleware,
    medicationReminderRoute.routes()
  )

  app.use(routes)
}

export { setup }
