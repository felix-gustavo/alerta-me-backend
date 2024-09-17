import crypto from 'crypto'
import { NextFunction, Request, Response, Router } from 'express'
import { ForbiddenException } from '../../../exceptions'
import { handleValidationErrors } from '../../../validations/handleValidationErrors'
import { AddNotificationWaterValidateScheme } from '../../../validations/schemes/addNotificationWaterValidate'
import {
  decodeAmazonTokenMiddleware,
  decodeFirebaseTokenMiddleware,
} from '../../../middlewares/decodeTokenMiddleware'
import { setHistoryValidateScheme } from '../../../validations/schemes/setHistoryValidade'
import { WaterReminderHistoryController } from '../../../controllers/waterReminderHistoryController'
import { getHistoryUserValidate } from '../../../validations/schemes/getHistoryUserValidate'

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