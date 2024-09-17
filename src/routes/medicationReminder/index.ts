import { Router } from 'express'
import { handleValidationErrors } from '../../validations/handleValidationErrors'
import { createMedicationValidate } from '../../validations/schemes/createMedicationValidate'
import { MedicationReminderController } from '../../controllers/medicationReminderController'
import { updateMedicationValidate } from '../../validations/schemes/updateMedicationValidate'
import { paramValidateScheme } from '../../validations/schemes/paramValidateScheme'

class MedicationReminderRoute {
  constructor(private readonly controller: MedicationReminderController) {}

  routes = (): Router => {
    const medicationReminderRoute = Router()

    medicationReminderRoute.post(
      '/',
      createMedicationValidate,
      handleValidationErrors,
      this.controller.create
    )
    medicationReminderRoute.get('/', this.controller.get)
    medicationReminderRoute.put(
      '/:id',
      updateMedicationValidate,
      handleValidationErrors,
      this.controller.update
    )
    medicationReminderRoute.delete(
      '/:id',
      paramValidateScheme('id'),
      handleValidationErrors,
      this.controller.delete
    )

    return medicationReminderRoute
  }
}

export { MedicationReminderRoute }
