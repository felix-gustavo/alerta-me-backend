import {
  AddNotificationParams,
  IWaterHistoryService,
} from '../services/waterHistoryService/iWaterHistoryService'
import { Request, Response } from 'express'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'

class WaterReminderHistoryController {
  constructor(private readonly waterHistoryService: IWaterHistoryService) {}

  addHistory = async (req: Request, res: Response) => {
    const data: AddNotificationParams = req.body
    const response = await this.waterHistoryService.addHistory(data)
    res.json(response)
  }

  getHistoryElderly = async (req: CustomRequest, res: Response) => {
    const elderlyId = req.user?.user_id as string
    const response = await this.waterHistoryService.getHistoryElderly({
      elderlyId,
    })

    res.json(response)
  }

  getRecentHistoryUser = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const response = await this.waterHistoryService.getRecentHistoryUser({
      userId,
    })

    res.json(response)
  }

  getHistoryUser = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const dateStr = req.params.date

    const response = await this.waterHistoryService.getHistoryUser({
      userId,
      dateStr,
    })

    res.json(response)
  }

  getOlderDateHistoryUser = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string

    const response = await this.waterHistoryService.getOlderDateHistoryUser({
      userId,
    })

    res.json(response)
  }

  setAmountHistory = async (req: CustomRequest, res: Response) => {
    const elderlyId = req.user?.user_id as string
    const id = req.params.id as string
    const amount = parseInt(req.body.amount)

    await this.waterHistoryService.setAmountHistory({
      id,
      amount,
      elderlyId,
    })

    res.json(id)
  }
}

export { WaterReminderHistoryController }
