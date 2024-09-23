import { Router } from 'express'
import { WaterHistoryRoute } from './waterHistory/index'
import { WaterReminderController } from '../../controllers/waterReminderController'
import { WaterReminderHistoryController } from '../../controllers/waterReminderHistoryController'
import { createWaterValidate } from '../../validations/schemes/createWaterValidate'
import { decodeFirebaseTokenMiddleware } from '../../middlewares/decodeTokenMiddleware'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { updateWaterValidate } from '../../validations/schemes/updateWaterValidate'

class WaterReminderRoute {
  constructor(
    private readonly waterReminderController: WaterReminderController,
    private readonly waterReminderHistoryController: WaterReminderHistoryController,
  ) {}

  routes = (): Router => {
    const waterReminderRoute = Router()
    waterReminderRoute.use(
      new WaterHistoryRoute(this.waterReminderHistoryController).routes(),
    )

    waterReminderRoute.post(
      '/',
      createWaterValidate,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.waterReminderController.create,
    )

    waterReminderRoute.get(
      '/',
      decodeFirebaseTokenMiddleware,
      this.waterReminderController.get,
    )

    waterReminderRoute.put(
      '/',
      updateWaterValidate,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.waterReminderController.update,
    )

    return waterReminderRoute
  }
}

export { WaterReminderRoute }
