import { Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { createMedicationReminderValidateScheme } from '../../validations/schemes/createMedicationReminderValidate'
import { MedicationReminderController } from '../../controllers/medicationReminderController'
import { updateMedicationReminderValidate } from '../../validations/schemes/updateMedicationReminderValidate'

class MedicationReminderRoute {
  constructor(private readonly controller: MedicationReminderController) {}

  routes = (): Router => {
    const medicationReminderRoute = Router()

    medicationReminderRoute.post(
      '/',
      createMedicationReminderValidateScheme,
      handleValidationErrors,
      this.controller.create
    )
    medicationReminderRoute.get('/', this.controller.get)
    medicationReminderRoute.put(
      '/:id',
      updateMedicationReminderValidate,
      handleValidationErrors,
      this.controller.update
    )

    return medicationReminderRoute
  }
}

export { MedicationReminderRoute }
