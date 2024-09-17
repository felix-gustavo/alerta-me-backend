import { MedicationReminderController } from '../../controllers/medicationReminderController.ts'
import { Router } from 'express'
import { createMedicationValidate } from '../../validations/schemes/createMedicationValidate.ts'
import { handleValidationErrors } from '../../validations/handleValidationErrors.ts'
import { paramValidateScheme } from '../../validations/schemes/paramValidateScheme.ts'
import { updateMedicationValidate } from '../../validations/schemes/updateMedicationValidate.ts'

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
