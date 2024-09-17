import { createMedicationValidate } from './createMedicationValidate.ts'
import { paramValidateScheme } from './paramValidateScheme.ts'

const updateMedicationValidate = [
  ...paramValidateScheme('id'),
  ...createMedicationValidate.map((check) => check.optional()),
]

export { updateMedicationValidate }
