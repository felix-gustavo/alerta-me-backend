import { Response, Request } from 'express'
import {
  AddNotificationParams,
  CreateWaterReminderParams,
  IWaterReminderService,
  UpdateWaterReminderParams,
} from '../services/waterReminderService/iWaterReminderService'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'

class WaterReminderController {
  constructor(private readonly waterReminderService: IWaterReminderService) {}

  create = async (req: CustomRequest, res: Response) => {
    const data: Omit<CreateWaterReminderParams, 'userId'> = req.body
    const userId = req.user?.user_id as string
    const userName = req.user?.name as string

    const response = await this.waterReminderService.create({
      ...data,
      userId,
      userName,
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
    const userName = req.user?.name as string

    const response = await this.waterReminderService.update({
      ...data,
      userId,
      userName,
    })

    res.json(response)
  }

  addHistory = async (req: Request, res: Response) => {
    const data: AddNotificationParams = req.body
    const response = await this.waterReminderService.addHistory(data)
    res.json(response)
  }

  getRecentHistory = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const response = await this.waterReminderService.getRecentHistory({
      userId,
    })

    res.json(response)
  }

  setAmountHistory = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const id = req.body.id
    const amount = req.body.amount

    await this.waterReminderService.setAmountHistory({
      id,
      amount,
      userId,
    })

    res.json(id)
  }
}

export { WaterReminderController }
