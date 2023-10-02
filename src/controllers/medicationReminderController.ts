import { Response } from 'express'
import { CustomRequest } from '../middlewares/verifyTokenMiddleware'
import { CustomError } from '../exceptions/customError'
import { WithoutTokenException } from '../exceptions'
import {
  CreateMedicationReminderParams,
  IMedicationReminderService,
  UpdateMedicationReminderParams,
} from '../services/medicationReminderService/iMedicationReminderService'

class MedicationReminderController {
  constructor(private service: IMedicationReminderService) {}

  create = async (req: CustomRequest, res: Response) => {
    const data: Omit<CreateMedicationReminderParams, 'userId'> = req.body

    try {
      const userId = req.user?.id
      if (!userId) throw new WithoutTokenException()

      const response = await this.service.create({
        ...data,
        userId,
      })

      res.json(response)
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.code).json(error.message)
      }

      res.status(500).json('Erro interno do servidor')
    }
  }

  get = async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) throw new WithoutTokenException()

      const response = await this.service.get({ userId })

      res.json(response)
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.code).json(error.message)
      }

      res.status(500).json('Erro interno do servidor')
    }
  }

  update = async (req: CustomRequest, res: Response) => {
    try {
      const id = req.params.id as string

      const userId = req.user?.id
      if (!userId) throw new WithoutTokenException()

      const data: Omit<UpdateMedicationReminderParams, 'userId' | 'id'> =
        req.body

      const response = await this.service.update({
        ...data,
        id,
        userId,
      })

      res.json(response)
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.code).json(error.message)
      }

      res.status(500).json('Erro interno do servidor')
    }
  }

  delete = async (req: CustomRequest, res: Response) => {
    try {
      const id = req.params.id as string

      const userId = req.user?.id
      if (!userId) throw new WithoutTokenException()

      const response = await this.service.delete({ id, userId })

      res.json(response)
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.code).json(error.message)
      }

      res.status(500).json('Erro interno do servidor')
    }
  }
}

export { MedicationReminderController }
