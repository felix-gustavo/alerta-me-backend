import { Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { MedicalReminderController } from '../../controllers/medicalReminderController'
import { createMedicalReminderValidateScheme } from '../../validations/schemes/createMedicalReminderValidate'
import { updateMedicalReminderValidate } from '../../validations/schemes/updateMedicalReminderValidate'

class MedicalReminderRoute {
  constructor(private readonly controller: MedicalReminderController) {}

  routes = (): Router => {
    const medicalReminderRoute = Router()

    medicalReminderRoute.post(
      '/',
      createMedicalReminderValidateScheme,
      handleValidationErrors,
      this.controller.create
    )
    medicalReminderRoute.get('/', this.controller.get)
    medicalReminderRoute.put(
      '/:id',
      updateMedicalReminderValidate,
      handleValidationErrors,
      this.controller.update
    )

    return medicalReminderRoute
  }
}

export { MedicalReminderRoute }
