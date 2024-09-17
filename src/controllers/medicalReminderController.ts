import {
  CreateMedicalReminderStringParams,
  IMedicalReminderService,
  UpdateMedicalReminderParams,
} from '../services/medicalReminderService/iMedicalReminderService.ts'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware.ts'
import { Response } from 'express'
import { UnauthorizedException } from '../exceptions/index.ts'

class MedicalReminderController {
  constructor(private readonly service: IMedicalReminderService) {}

  create = async (req: CustomRequest, res: Response) => {
    const data: Omit<CreateMedicalReminderStringParams, 'userId'> = req.body
    if (!req.user) throw new UnauthorizedException()

    const response = await this.service.create({
      ...data,
      userId: req.user.user_id,
    })
    res.json(response)
  }

  get = async (req: CustomRequest, res: Response) => {
    const isPast = (req.query.isPast as string | undefined) === 'true'
    const userId = req.user?.user_id as string

    const response = await this.service.get({ userId, isPast: isPast })
    res.json(response)
  }

  getToUpdate = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string

    const response = await this.service.getToUpdate({ userId })
    res.json(response)
  }

  update = async (req: CustomRequest, res: Response) => {
    const id = req.params.id as string
    const userId = req.user?.user_id as string

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
    const userId = req.user?.user_id as string

    await this.service.delete({ id, userId })
    res.status(204).send()
  }
}

export { MedicalReminderController }
