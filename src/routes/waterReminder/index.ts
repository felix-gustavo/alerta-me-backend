import { NextFunction, Request, Response, Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { WaterReminderController } from '../../controllers/waterReminderController'
import { createWaterReminderValidateScheme } from '../../validations/schemes/createWaterReminderValidate'
import { updateWaterReminderValidateScheme } from '../../validations/schemes/updateWaterReminderValidate'
import {
  decodeAmazonTokenMiddleware,
  decodeFirebaseTokenMiddleware,
} from '../../middlewares/decodeTokenMiddleware'
import { AddNotificationWaterValidateScheme } from '../../validations/schemes/addNotificationWaterValidate'
import { ForbiddenException } from '../../exceptions'

class WaterReminderRoute {
  constructor(private readonly controller: WaterReminderController) {}

  routes = (): Router => {
    const waterReminderRoute = Router()

    waterReminderRoute.post(
      '/notifications',
      AddNotificationWaterValidateScheme,
      handleValidationErrors,
      (req: Request, _: Response, next: NextFunction) => {
        console.log('req.headers.authorization: ', req.headers.authorization)
        if (req.headers.authorization === process.env.SECRET) return next()

        throw new ForbiddenException()
      },
      this.controller.addNotifications
    )

    waterReminderRoute.post(
      '/',
      createWaterReminderValidateScheme,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.create
    )

    waterReminderRoute.get(
      '/notifications',
      decodeAmazonTokenMiddleware,
      this.controller.getNotifications
    )

    waterReminderRoute.get(
      '/',
      decodeFirebaseTokenMiddleware,
      this.controller.get
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
