import { createMedicationValidate } from './createMedicationValidate'
import { paramValidateScheme } from './paramValidateScheme'

const updateMedicationValidate = [
  ...paramValidateScheme('id'),
  ...createMedicationValidate.map((check) => check.optional()),
]

export { updateMedicationValidate }
