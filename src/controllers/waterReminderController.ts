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

    const response = await this.waterReminderService.create({
      ...data,
      userId,
    })

    res.json(response)
  }

  addNotifications = async (req: Request, res: Response) => {
    const data: AddNotificationParams = req.body
    const response = await this.waterReminderService.addNotifications(data)
    res.json(response)
  }

  get = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const response = await this.waterReminderService.get({ userId })

    res.json(response)
  }

  getNotifications = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const response = await this.waterReminderService.getNotifications({
      userId,
    })

    res.json(response)
  }

  update = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const data: Omit<UpdateWaterReminderParams, 'userId'> = req.body

    const response = await this.waterReminderService.update({
      ...data,
      userId,
    })

    res.json(response)
  }
}

export { WaterReminderController }
