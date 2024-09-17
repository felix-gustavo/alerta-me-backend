import { MedicalReminderController } from '../../controllers/medicalReminderController.ts'
import { Router } from 'express'
import { createMedicalValidate } from '../../validations/schemes/createMedicalValidate.ts'
import { getMedicalValidate } from '../../validations/schemes/getMedicalValidate.ts'
import { handleValidationErrors } from '../../validations/handleValidationErrors.ts'
import { paramValidateScheme } from '../../validations/schemes/paramValidateScheme.ts'
import { updateMedicalValidate } from '../../validations/schemes/updateMedicalValidate.ts'

class MedicalReminderRoute {
  constructor(private readonly controller: MedicalReminderController) {}

  routes = (): Router => {
    const medicalReminderRoute = Router()

    medicalReminderRoute.post(
      '/',
      createMedicalValidate,
      handleValidationErrors,
      this.controller.create
    )
    medicalReminderRoute.get('/to-update', this.controller.getToUpdate)
    medicalReminderRoute.get(
      '/',
      getMedicalValidate,
      handleValidationErrors,
      this.controller.get
    )
    medicalReminderRoute.put(
      '/:id',
      updateMedicalValidate,
      handleValidationErrors,
      this.controller.update
    )
    medicalReminderRoute.delete(
      '/:id',
      paramValidateScheme('id'),
      handleValidationErrors,
      this.controller.delete
    )

    return medicalReminderRoute
  }
}

export { MedicalReminderRoute }
