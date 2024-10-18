import { MedicalReminderController } from '../../controllers/medicalReminderController'
import { Router } from 'express'
import { createMedicalValidate } from '../../validations/schemes/createMedicalValidate'
import { getMedicalValidate } from '../../validations/schemes/getMedicalValidate'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { paramValidateScheme } from '../../validations/schemes/paramValidateScheme'
import { updateMedicalValidate } from '../../validations/schemes/updateMedicalValidate'
import {
  decodeAmazonTokenMiddleware,
  decodeFirebaseTokenMiddleware,
} from '../../middlewares/decodeTokenMiddleware'

class MedicalReminderRoute {
  constructor(private readonly controller: MedicalReminderController) {}

  routes = (): Router => {
    const medicalReminderRoute = Router()

    medicalReminderRoute.post(
      '/',
      createMedicalValidate,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.create,
    )
    medicalReminderRoute.get(
      '/to-update',
      decodeAmazonTokenMiddleware,
      this.controller.getToUpdate,
    )
    medicalReminderRoute.get(
      '/',
      getMedicalValidate,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.get,
    )
    medicalReminderRoute.put(
      '/:id',
      updateMedicalValidate,
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.update,
    )
    medicalReminderRoute.delete(
      '/:id',
      paramValidateScheme('id'),
      handleValidationErrors,
      decodeFirebaseTokenMiddleware,
      this.controller.delete,
    )

    return medicalReminderRoute
  }
}

export { MedicalReminderRoute }
