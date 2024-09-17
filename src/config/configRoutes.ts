import { Express, Router } from 'express'
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
import { WaterReminderHistoryController } from '../controllers/waterReminderHistoryController'
import { WaterHistoryService } from '../services/waterHistoryService/waterHistoryService'
import { WaterScheduler } from '../services/amazonSchedulers/waterScheduler'
import { MedicalScheduler } from '../services/amazonSchedulers/medicalScheduler'
import { ProactiveRoute } from '../routes/proactive'
import { ProactiveController } from '../controllers/proactiveController'
import { ProactiveService } from '../services/proactiveService/proactiveService'

const setup = (app: Express) => {
  const routes = Router()
  const waterScheduler = new WaterScheduler('water')
  const medicalScheduler = new MedicalScheduler('medical')

  const usersService = UsersService.getInstance()
  const authorizationService = new AuthorizationService(usersService)
  const waterReminderService = new WaterReminderService(
    authorizationService,
    usersService,
    waterScheduler
  )
  const medicalReminderService = new MedicalReminderService(
    authorizationService,
    usersService,
    medicalScheduler
  )
  const medicationReminderService = new MedicationReminderService(
    authorizationService
  )
  const proactiveService = new ProactiveService(usersService, [
    waterReminderService,
    medicalReminderService,
  ])

  const authorizationController = new AuthorizationController(
    authorizationService
  )
  const usersController = new UsersController(usersService)
  const waterReminderController = new WaterReminderController(
    waterReminderService
  )
  const waterReminderHistoryController = new WaterReminderHistoryController(
    new WaterHistoryService(authorizationService)
  )
  const medicalReminderController = new MedicalReminderController(
    medicalReminderService
  )
  const medicationReminderController = new MedicationReminderController(
    medicationReminderService
  )
  const proactiveController = new ProactiveController(proactiveService)

  const authorizationRoute = new AuthorizationRoute(authorizationController)
  const usersRoute = new UserRoute(usersController)
  const waterReminderRoute = new WaterReminderRoute(
    waterReminderController,
    waterReminderHistoryController
  )
  const medicalReminderRoute = new MedicalReminderRoute(
    medicalReminderController
  )
  const medicationReminderRoute = new MedicationReminderRoute(
    medicationReminderController
  )
  const proactiveRoute = new ProactiveRoute(proactiveController)

  routes.use('/', helloRoute)
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
  routes.use('/proactive-sub', proactiveRoute.routes())

  app.use(routes)
}

export { setup }
