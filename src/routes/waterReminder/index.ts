import { Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { WaterReminderController } from '../../controllers/waterReminderController'
import { createWaterReminderValidateScheme } from '../../validations/schemes/createWaterReminderValidate'
import { updateWaterReminderValidateScheme } from '../../validations/schemes/updateWaterReminderValidate'

class WaterReminderRoute {
  constructor(private readonly controller: WaterReminderController) {}

  routes = (): Router => {
    const waterReminderRoute = Router()

    waterReminderRoute.post(
      '/',
      createWaterReminderValidateScheme,
      handleValidationErrors,
      this.controller.create
    )

    waterReminderRoute.get('/', this.controller.get)
    waterReminderRoute.put(
      '/',
      updateWaterReminderValidateScheme,
      handleValidationErrors,
      this.controller.update
    )

    return waterReminderRoute
  }
}

export { WaterReminderRoute }
