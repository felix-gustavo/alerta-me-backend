import {
  CreateWaterReminderStringParams,
  IWaterReminderService,
  UpdateWaterReminderParams,
} from '../services/waterReminderService/iWaterReminderService.ts'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware.ts'
import { Response } from 'express'

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
