import { Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { WaterReminderController } from '../../controllers/waterReminderController'
import { createWaterReminderValidateScheme } from '../../validations/schemes/createWaterReminderValidate'
import { updateWaterReminderValidateScheme } from '../../validations/schemes/updateWaterReminderValidate'
import {
  decodeAmazonTokenMiddleware,
  decodeFirebaseTokenMiddleware,
} from '../../middlewares/decodeTokenMiddleware'

class WaterReminderRoute {
  constructor(private readonly controller: WaterReminderController) {}

  routes = (): Router => {
    const waterReminderRoute = Router()

    waterReminderRoute.post(
      '/',
      createWaterReminderValidateScheme,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.create
    )

    waterReminderRoute.get(
      '/',
      decodeFirebaseTokenMiddleware,
      this.controller.get
    )

    waterReminderRoute.get(
      '/notifications',
      decodeAmazonTokenMiddleware,
      this.controller.getNotifications
    )

    waterReminderRoute.put(
      '/',
      updateWaterReminderValidateScheme,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.update
    )

    return waterReminderRoute
  }
}

export { WaterReminderRoute }
