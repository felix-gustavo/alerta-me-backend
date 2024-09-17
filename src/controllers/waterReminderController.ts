import { Response } from 'express'
import {
  IWaterReminderService,
  UpdateWaterReminderParams,
  CreateWaterReminderStringParams,
} from '../services/waterReminderService/iWaterReminderService'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'

class WaterReminderController {
  constructor(private readonly waterReminderService: IWaterReminderService) {}

  create = async (req: CustomRequest, res: Response) => {
    const data: Omit<CreateWaterReminderStringParams, 'userId'> = req.body
    const userId = req.user?.user_id as string
    // const userName = req.user?.name as string

    const response = await this.waterReminderService.create({
      ...data,
      userId,
      // userName,
    })

    res.json(response)
  }

  get = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const response = await this.waterReminderService.get({ userId })

    res.json(response)
  }

  update = async (req: CustomRequest, res: Response) => {
    const data: Omit<UpdateWaterReminderParams, 'userId'> = req.body
    const userId = req.user?.user_id as string
    // const userName = req.user?.name as string

    const response = await this.waterReminderService.update({
      ...data,
      userId,
      // userName,
    })

    res.json(response)
  }
}

export { WaterReminderController }
