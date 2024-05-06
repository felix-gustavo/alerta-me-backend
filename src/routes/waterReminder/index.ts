import crypto from 'crypto'
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
import { setHistoryValidateScheme } from '../../validations/schemes/setHistoryValidade'

class WaterReminderRoute {
  constructor(private readonly controller: WaterReminderController) {}

  routes = (): Router => {
    const waterReminderRoute = Router()

    waterReminderRoute.post(
      '/recent-history',
      AddNotificationWaterValidateScheme,
      handleValidationErrors,
      (req: Request, _: Response, next: NextFunction) => {
        const expectedHash = crypto
          .createHmac('sha256', process.env.SECRET ?? '')
          .update(process.env.DATA_SECRET ?? '')
          .digest('hex')

        if (req.headers.secret === expectedHash) return next()
        throw new ForbiddenException()
      },
      this.controller.addHistory
    )

    waterReminderRoute.post(
      '/',
      createWaterReminderValidateScheme,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.create
    )

    waterReminderRoute.get(
      '/recent-history',
      decodeAmazonTokenMiddleware,
      this.controller.getRecentHistory
    )

    waterReminderRoute.put(
      '/set-amount-history',
      setHistoryValidateScheme,
      handleValidationErrors,
      decodeAmazonTokenMiddleware,
      this.controller.setAmountHistory
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
