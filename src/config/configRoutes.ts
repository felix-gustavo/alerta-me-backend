import { Express, Router } from 'express'
import { AuthorizationController } from '../controllers/authorizationController.ts'
import { AuthorizationRoute } from '../routes/authorization/index.ts'
import { AuthorizationService } from '../services/authorizationService/authorizationService.ts'
import { MedicalReminderController } from '../controllers/medicalReminderController.ts'
import { MedicalReminderRoute } from '../routes/medicalReminder/index.ts'
import { MedicalReminderService } from '../services/medicalReminderService/medicalReminderService.ts'
import { MedicalScheduler } from '../services/amazonSchedulers/medicalScheduler.ts'
import { MedicationReminderController } from '../controllers/medicationReminderController.ts'
import { MedicationReminderRoute } from '../routes/medicationReminder/index.ts'
import { MedicationReminderService } from '../services/medicationReminderService/medicationReminderService.ts'
import { ProactiveController } from '../controllers/proactiveController.ts'
import { ProactiveRoute } from '../routes/proactive/index.ts'
import { ProactiveService } from '../services/proactiveService/proactiveService.ts'
import { UserRoute } from '../routes/user/index.ts'
import { UsersController } from '../controllers/usersController.ts'
import { UsersService } from '../services/usersService/usersService.ts'
import { WaterHistoryService } from '../services/waterHistoryService/waterHistoryService.ts'
import { WaterReminderController } from '../controllers/waterReminderController.ts'
import { WaterReminderHistoryController } from '../controllers/waterReminderHistoryController.ts'
import { WaterReminderRoute } from '../routes/waterReminder/index.ts'
import { WaterReminderService } from '../services/waterReminderService/waterReminderService.ts'
import { WaterScheduler } from '../services/amazonSchedulers/waterScheduler.ts'
import { decodeFirebaseTokenMiddleware } from '../middlewares/decodeTokenMiddleware.ts'
import { helloRoute } from '../routes/hello/index.ts'

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
