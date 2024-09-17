import { createWaterValidate } from './createWaterValidate'

const updateWaterValidate = [
  ...createWaterValidate.map((check) => check.optional()),
]

export { updateWaterValidate }
