import { createWaterValidate } from './createWaterValidate.ts'

const updateWaterValidate = [
  ...createWaterValidate.map((check) => check.optional()),
]

export { updateWaterValidate }
