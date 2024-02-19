import { Response } from 'express'
import {
  CreateWaterReminderParams,
  IWaterReminderService,
  UpdateWaterReminderParams,
} from '../services/waterReminderService/iWaterReminderService'
import { WithoutTokenException } from '../exceptions'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'

class WaterReminderController {
  constructor(private readonly waterReminderService: IWaterReminderService) {}

  create = async (req: CustomRequest, res: Response) => {
    const data: Omit<CreateWaterReminderParams, 'userId'> = req.body

    const userId = req.user?.user_id
    if (!userId) throw new WithoutTokenException()

    const response = await this.waterReminderService.create({
      ...data,
      userId,
    })

    res.json(response)
  }

  get = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id
    if (!userId) throw new WithoutTokenException()

    const response = await this.waterReminderService.get({ userId })

    res.json(response)
  }

  update = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id
    if (!userId) throw new WithoutTokenException()

    const data: Omit<UpdateWaterReminderParams, 'userId'> = req.body

    const response = await this.waterReminderService.update({
      ...data,
      userId,
    })

    res.json(response)
  }
}

export { WaterReminderController }
