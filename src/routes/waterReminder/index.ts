import { Router } from 'express'
import { WaterHistoryRoute } from './waterHistory/index.ts'
import { WaterReminderController } from '../../controllers/waterReminderController.ts'
import { WaterReminderHistoryController } from '../../controllers/waterReminderHistoryController.ts'
import { createWaterValidate } from '../../validations/schemes/createWaterValidate.ts'
import { decodeFirebaseTokenMiddleware } from '../../middlewares/decodeTokenMiddleware.ts'
import { handleValidationErrors } from '../../validations/handleValidationErrors.ts'
import { updateWaterValidate } from '../../validations/schemes/updateWaterValidate.ts'

class WaterReminderRoute {
  constructor(
    private readonly waterReminderController: WaterReminderController,
    private readonly waterReminderHistoryController: WaterReminderHistoryController
  ) {}

  routes = (): Router => {
    const waterReminderRoute = Router()
    waterReminderRoute.use(
      new WaterHistoryRoute(this.waterReminderHistoryController).routes()
    )

    waterReminderRoute.post(
      '/',
      createWaterValidate,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.waterReminderController.create
    )

    waterReminderRoute.get(
      '/',
      decodeFirebaseTokenMiddleware,
      this.waterReminderController.get
    )

    waterReminderRoute.put(
      '/',
      updateWaterValidate,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.waterReminderController.update
    )

    return waterReminderRoute
  }
}

export { WaterReminderRoute }
