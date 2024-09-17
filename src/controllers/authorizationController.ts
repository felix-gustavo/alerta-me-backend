import { CustomRequest } from '../middlewares/decodeTokenMiddleware.ts'
import { IAuthorizationService } from '../services/authorizationService/iAuthorizationService.ts'
import { Response } from 'express'

class AuthorizationController {
  constructor(private readonly authorizationService: IAuthorizationService) {}

  create = async (req: CustomRequest, res: Response) => {
    const { elderly }: { elderly: string } = req.body
    const userId = req.user?.user_id as string

    const response = await this.authorizationService.create({
      elderlyEmail: elderly,
      userId,
    })
    res.json(response)
  }

  getAuthorizationByUser = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const response = await this.authorizationService.getByUser({ userId })

    res.json(response)
  }

  getAuthorizationByElderly = async (req: CustomRequest, res: Response) => {
    const elderlyId = req.user?.user_id as string
    const response = await this.authorizationService.getByElderly({ elderlyId })

    res.json(response)
  }

  approvedAuthorizationElderly = async (req: CustomRequest, res: Response) => {
    const id = req.params.id as string
    const userId = req.user?.user_id as string

    await this.authorizationService.updateStatus({
      id,
      status: 'aprovado',
      elderlyId: userId,
    })

    res.status(204).send()
  }

  deleteAuthorization = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const id = await this.authorizationService.delete({ userId })

    res.json({ id })
  }
}

export { AuthorizationController }
