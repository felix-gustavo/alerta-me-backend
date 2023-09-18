import { Response } from 'express'
import { CustomRequest } from '../middlewares/verifyTokenMiddleware'
import {
  CreateWaterReminderParams,
  IWaterReminderService,
} from '../services/waterReminderService/iWaterReminderService'
import { WithoutTokenException } from '../exceptions'

class WaterReminderController {
  constructor(private readonly waterReminderService: IWaterReminderService) {}

  create = async (req: CustomRequest, res: Response) => {
    const data: Omit<CreateWaterReminderParams, 'userId'> = req.body

    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    const response = await this.waterReminderService.create({
      ...data,
      userId,
    })

    res.json(response)
  }

  get = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    const response = await this.waterReminderService.get({ userId })

    res.json(response)
  }

  update = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) throw new WithoutTokenException()

    const data: Omit<CreateWaterReminderParams, 'userId'> = req.body

    const response = await this.waterReminderService.update({
      ...data,
      userId,
    })

    res.json(response)
  }
}

export { WaterReminderController }
