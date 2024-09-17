import { Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { WaterReminderController } from '../../controllers/waterReminderController'
import { createWaterValidate } from '../../validations/schemes/createWaterValidate'
import { updateWaterValidate } from '../../validations/schemes/updateWaterValidate'
import { decodeFirebaseTokenMiddleware } from '../../middlewares/decodeTokenMiddleware'
import { WaterHistoryRoute } from './waterHistory'
import { WaterReminderHistoryController } from '../../controllers/waterReminderHistoryController'

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
