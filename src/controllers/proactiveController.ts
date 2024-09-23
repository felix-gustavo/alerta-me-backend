import { CustomRequest } from '../middlewares/decodeTokenMiddleware'
import { IProactiveService } from '../services/proactiveService/iProactiveService'
import { Response } from 'express'

class ProactiveController {
  constructor(private readonly proactiveService: IProactiveService) {}

  proactiveSubAccepted = async (req: CustomRequest, res: Response) => {
    const elderlyId = req.user?.user_id as string
    const ask_user_id = req.body.ask_user_id

    const response = await this.proactiveService.proactiveSubAccepted({
      elderlyId,
      ask_user_id,
    })

    res.json({ response })
  }

  proactiveSubDisabled = async (req: CustomRequest, res: Response) => {
    const elderlyId = req.user?.user_id as string
    const response = await this.proactiveService.proactiveSubDisabled({
      elderlyId,
    })

    res.json({ response })
  }
}

export { ProactiveController }
