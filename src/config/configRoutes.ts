import { Express, Router } from 'express'
import { AuthorizationController } from '../controllers/authorizationController'
import { AuthorizationRoute } from '../routes/authorization/index'
import { AuthorizationService } from '../services/authorizationService/authorizationService'
import { MedicalReminderController } from '../controllers/medicalReminderController'
import { MedicalReminderRoute } from '../routes/medicalReminder/index'
import { MedicalReminderService } from '../services/medicalReminderService/medicalReminderService'
import { MedicalScheduler } from '../services/amazonSchedulers/medicalScheduler'
import { MedicationReminderController } from '../controllers/medicationReminderController'
import { MedicationReminderRoute } from '../routes/medicationReminder/index'
import { MedicationReminderService } from '../services/medicationReminderService/medicationReminderService'
import { ProactiveController } from '../controllers/proactiveController'
import { ProactiveRoute } from '../routes/proactive/index'
import { ProactiveService } from '../services/proactiveService/proactiveService'
import { UserRoute } from '../routes/user/index'
import { UsersController } from '../controllers/usersController'
import { UsersService } from '../services/usersService/usersService'
import { WaterHistoryService } from '../services/waterHistoryService/waterHistoryService'
import { WaterReminderController } from '../controllers/waterReminderController'
import { WaterReminderHistoryController } from '../controllers/waterReminderHistoryController'
import { WaterReminderRoute } from '../routes/waterReminder/index'
import { WaterReminderService } from '../services/waterReminderService/waterReminderService'
import { WaterScheduler } from '../services/amazonSchedulers/waterScheduler'
import { decodeFirebaseTokenMiddleware } from '../middlewares/decodeTokenMiddleware'
import { helloRoute } from '../routes/hello/index'

const setup = (app: Express) => {
  const routes = Router()
  const waterScheduler = new WaterScheduler('water')
  const medicalScheduler = new MedicalScheduler('medical')

  const usersService = UsersService.getInstance()
  const authorizationService = new AuthorizationService(usersService)
  const waterReminderService = new WaterReminderService(
    authorizationService,
    usersService,
    waterScheduler,
  )
  const medicalReminderService = new MedicalReminderService(
    authorizationService,
    usersService,
    medicalScheduler,
  )
  const medicationReminderService = new MedicationReminderService(
    authorizationService,
  )
  const proactiveService = new ProactiveService(usersService, [
    waterReminderService,
    medicalReminderService,
  ])

  const authorizationController = new AuthorizationController(
    authorizationService,
  )
  const usersController = new UsersController(usersService)
  const waterReminderController = new WaterReminderController(
    waterReminderService,
  )
  const waterReminderHistoryController = new WaterReminderHistoryController(
    new WaterHistoryService(authorizationService),
  )
  const medicalReminderController = new MedicalReminderController(
    medicalReminderService,
  )
  const medicationReminderController = new MedicationReminderController(
    medicationReminderService,
  )
  const proactiveController = new ProactiveController(proactiveService)

  const authorizationRoute = new AuthorizationRoute(authorizationController)
  const usersRoute = new UserRoute(usersController)
  const waterReminderRoute = new WaterReminderRoute(
    waterReminderController,
    waterReminderHistoryController,
  )
  const medicalReminderRoute = new MedicalReminderRoute(
    medicalReminderController,
  )
  const medicationReminderRoute = new MedicationReminderRoute(
    medicationReminderController,
  )
  const proactiveRoute = new ProactiveRoute(proactiveController)

  routes.use('/', helloRoute)
  routes.use('/authorizations', authorizationRoute.routes())
  routes.use('/users', usersRoute.routes())
  routes.use('/water-reminders', waterReminderRoute.routes())
  routes.use('/medical-reminders', medicalReminderRoute.routes())
  routes.use(
    '/medication-reminders',
    decodeFirebaseTokenMiddleware,
    medicationReminderRoute.routes(),
  )
  routes.use('/proactive-sub', proactiveRoute.routes())

  app.use(routes)
}

export { setup }
