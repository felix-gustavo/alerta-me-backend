import { Response } from 'express'
import { CustomRequest } from '../middlewares/verifyTokenMiddleware'
import { IAuthorizationService } from '../services/authorizationService/iAuthorizationService'
import { UnauthorizedException } from '../exceptions'

class AuthorizationController {
  constructor(private readonly authorizationService: IAuthorizationService) {}

  create = async (req: CustomRequest, res: Response) => {
    const { elderly }: { elderly: string } = req.body

    const userId = req.user?.id
    if (!userId) throw new UnauthorizedException()

    const response = await this.authorizationService.create({
      elderlyEmail: elderly,
      userId,
    })
    res.json(response)
  }

  getAuthorizationByUser = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) throw new UnauthorizedException()

    const response = await this.authorizationService.get({
      usersTypeId: userId,
      usersType: 'user',
    })

    res.json(response)
  }

  getAuthorizationByElderly = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) throw new UnauthorizedException()

    const response = await this.authorizationService.get({
      usersTypeId: userId,
      usersType: 'elderly',
    })

    res.json(response)
  }

  approvedAuthorizationElderly = async (req: CustomRequest, res: Response) => {
    const { id }: { id: string } = req.body

    const userId = req.user?.id
    if (!userId) throw new UnauthorizedException()

    await this.authorizationService.updateStatus({
      id,
      status: 'aprovado',
      usersType: 'elderly',
      usersTypeId: userId,
    })

    res.status(204).send()
  }
}

export { AuthorizationController }
