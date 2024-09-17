import { NextFunction, Request, Response, Router } from 'express'
import {
  decodeAmazonTokenMiddleware,
  decodeFirebaseTokenMiddleware,
} from '../../../middlewares/decodeTokenMiddleware.ts'
import { AddNotificationWaterValidateScheme } from '../../../validations/schemes/addNotificationWaterValidate.ts'
import { ForbiddenException } from '../../../exceptions/index.ts'
import { WaterReminderHistoryController } from '../../../controllers/waterReminderHistoryController.ts'
import crypto from 'crypto'
import { getHistoryUserValidate } from '../../../validations/schemes/getHistoryUserValidate.ts'
import { handleValidationErrors } from '../../../validations/handleValidationErrors.ts'
import { setHistoryValidateScheme } from '../../../validations/schemes/setHistoryValidade.ts'

class WaterHistoryRoute {
  constructor(private readonly controller: WaterReminderHistoryController) {}

  routes = (): Router => {
    const waterHistoryRoute = Router()

    waterHistoryRoute.post(
      '/history',
      AddNotificationWaterValidateScheme,
      handleValidationErrors,
      (req: Request, _: Response, next: NextFunction) => {
        const secret = process.env.SECRET ?? ''
        const dataSecret = process.env.DATA_SECRET ?? ''

        const expectedHash = crypto
          .createHmac('sha256', secret)
          .update(dataSecret)
          .digest('hex')

        if (req.headers.secret === expectedHash) return next()
        throw new ForbiddenException()
      },
      this.controller.addHistory
    )

    waterHistoryRoute.get(
      '/recent-history/elderly',
      decodeAmazonTokenMiddleware,
      this.controller.getHistoryElderly
    )

    waterHistoryRoute.get(
      '/recent-history/user',
      decodeFirebaseTokenMiddleware,
      this.controller.getRecentHistoryUser
    )

    waterHistoryRoute.get(
      '/history/user/:date',
      getHistoryUserValidate,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.getHistoryUser
    )

    waterHistoryRoute.get(
      '/older-date/history/user',
      decodeFirebaseTokenMiddleware,
      this.controller.getOlderDateHistoryUser
    )

    waterHistoryRoute.put(
      '/set-amount-history/:id',
      setHistoryValidateScheme,
      handleValidationErrors,
      decodeAmazonTokenMiddleware,
      this.controller.setAmountHistory
    )

    return waterHistoryRoute
  }
}

export { WaterHistoryRoute }
