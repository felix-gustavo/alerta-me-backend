import { Response } from 'express'
import { WithoutTokenException } from '../exceptions'
import {
  CreateMedicationReminderParams,
  IMedicationReminderService,
  UpdateMedicationReminderParams,
} from '../services/medicationReminderService/iMedicationReminderService'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'

class MedicationReminderController {
  constructor(private service: IMedicationReminderService) {}

  create = async (req: CustomRequest, res: Response) => {
    const data: Omit<CreateMedicationReminderParams, 'userId'> = req.body

    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    const response = await this.service.create({
      ...data,
      userId,
    })

    res.json(response)
  }

  get = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    const response = await this.service.get({ userId })

    res.json(response)
  }

  update = async (req: CustomRequest, res: Response) => {
    const id = req.params.id as string

    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    const data: Omit<UpdateMedicationReminderParams, 'userId' | 'id'> = req.body

    const response = await this.service.update({
      ...data,
      id,
      userId,
    })

    res.json(response)
  }

  delete = async (req: CustomRequest, res: Response) => {
    const id = req.params.id as string

    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    await this.service.delete({ id, userId })
    res.status(204).send()
  }
}

export { MedicationReminderController }
