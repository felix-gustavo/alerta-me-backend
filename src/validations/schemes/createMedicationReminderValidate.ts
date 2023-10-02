import { body } from 'express-validator'

const createMedicationReminderValidateScheme = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage(
      'Campo [name] deve ter pelo menos 3 e no máximo 100 caracteres'
    ),
  body('dosage_unit')
    .isLength({ min: 1, max: 10 })
    .withMessage('Campo [dosage_unit] deve ter no máximo 10 caracteres'),
  body('dosage_pronunciation')
    .isLength({ min: 3, max: 30 })
    .withMessage(
      'Campo [dosage_pronunciation] deve ter pelo menos 3 e no máximo 30 caracteres'
    ),
  body('comments')
    .optional()
    .isLength({ max: 512 })
    .withMessage('Campo [comments] deve ter no máximo 512 caracteres'),
  body('dose')
    .custom((value) => {
      const expectedKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const actualKeys = Object.keys(value)
      const invalidKeys = actualKeys.filter((k) => !expectedKeys.includes(k))

      if (invalidKeys.length > 0) {
        throw new Error(
          `As seguintes chaves não são esperadas em dose: ${invalidKeys.join(
            ', '
          )}`
        )
      }

      return true
    })
    .custom((value) => {
      const requiredKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const actualKeys = Object.keys(value)
      const missingKeys = requiredKeys.filter((k) => !actualKeys.includes(k))

      missingKeys.forEach((key) => {
        delete value[key]
      })

      const unknownKeys = actualKeys.filter(
        (key) => !requiredKeys.includes(key)
      )
      unknownKeys.forEach((key) => {
        delete value[key]
      })

      if (missingKeys.length > 0) {
        throw new Error(
          `No campo [dose], forneça valores para as seguintes chaves: ${missingKeys.join(
            ', '
          )}`
        )
      }

      return true
    }),
  body('dose.*').custom((value, { path }) => {
    const doseKey = path.split('.')[1]

    if (Array.isArray(value)) {
      const invalidElements = value.filter(
        (element) =>
          typeof element !== 'object' ||
          !Object.prototype.hasOwnProperty.call(element, 'time') ||
          !Object.prototype.hasOwnProperty.call(element, 'amount')
      )

      if (invalidElements.length > 0) {
        throw new Error(
          `No campo [dose], forneça para a propriedade [${doseKey}] um objeto com as propriedades [time] e [amount]`
        )
      }
    }

    return true
  }),
  body('dose.*.*.time')
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage((_, { path }) => {
      const doseKey = path.split('.')[1].split('[')[0]
      return `Campo [time] precisa representar hora (HH:MM) em [${doseKey}]`
    }),
  body('dose.*.*.amount')
    .isNumeric()
    .withMessage('Campo [amount] precisa sem um número'),
]

export { createMedicationReminderValidateScheme }
