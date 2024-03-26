import { Response } from 'express'
import { IAuthorizationService } from '../services/authorizationService/iAuthorizationService'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'

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

    const response = await this.authorizationService.get({
      usersTypeId: userId,
      usersType: 'user',
    })

    res.json(response)
  }

  getAuthorizationByElderly = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string

    const response = await this.authorizationService.get({
      usersTypeId: userId,
      usersType: 'elderly',
    })

    res.json(response)
  }

  approvedAuthorizationElderly = async (req: CustomRequest, res: Response) => {
    const { id }: { id: string } = req.body
    const userId = req.user?.user_id as string

    await this.authorizationService.updateStatus({
      id,
      status: 'aprovado',
      usersType: 'elderly',
      usersTypeId: userId,
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
