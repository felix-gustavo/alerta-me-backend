import { Response } from 'express'
import { WithoutTokenException } from '../exceptions'
import {
  CreateMedicalReminderParams,
  IMedicalReminderService,
  UpdateMedicalReminderParams,
} from '../services/medicalReminderService/iMedicalReminderService'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'

class MedicalReminderController {
  constructor(private readonly service: IMedicalReminderService) {}

  create = async (req: CustomRequest, res: Response) => {
    const data: Omit<CreateMedicalReminderParams, 'userId'> = req.body

    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    const response = await this.service.create({
      ...data,
      userId,
    })

    res.json(response)
  }

  get = async (req: CustomRequest, res: Response) => {
    const withPast = (req.query.withPast as string | undefined) === 'true'

    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    const response = await this.service.get({ userId, withPast: withPast })

    res.json(response)
  }

  update = async (req: CustomRequest, res: Response) => {
    const id = req.params.id as string

    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    const data: Omit<UpdateMedicalReminderParams, 'userId' | 'id'> = req.body

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

export { MedicalReminderController }
