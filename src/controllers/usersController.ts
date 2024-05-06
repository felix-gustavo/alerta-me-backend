import { Response, Request } from 'express'
import {
  CreateUsers,
  IUsersService,
  UserProfile,
  UserElderly,
} from '../services/usersService/iUsersService'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'
import { NotFoundException } from '../exceptions'

class UsersController {
  constructor(private readonly userService: IUsersService) {}

  createElderly = async (req: CustomRequest, res: Response) => {
    const user = req.user as UserProfile

    res.json(
      await this.userService.createElderly({
        id: user.user_id,
        name: user.name,
        email: user.email,
        ask_user_id: null,
      })
    )
  }

  getElderlyById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const user = await this.userService.getElderlyById(id)
    if (user == null) throw new NotFoundException('Usuário não encontrado')
    res.json(user)
  }

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const user = await this.userService.getById(id)
    if (user == null) throw new NotFoundException('Usuário não encontrado')
    res.json(user)
  }

  getByEmail = async (req: Request, res: Response) => {
    const email = req.params.email as string
    const user = await this.userService.getByEmail({ email })
    if (user == null) throw new NotFoundException('Usuário não encontrado')
    res.json(user)
  }

  proactiveSubAccepted = async (req: CustomRequest, res: Response) => {
    const elderlyId = req.user?.user_id as string
    const ask_user_id = req.body.ask_user_id

    const response = await this.userService.proactiveSubAccepted({
      elderlyId,
      ask_user_id,
    })

    res.json({ response })
  }

  proactiveSubDisabled = async (req: CustomRequest, res: Response) => {
    const elderlyId = req.user?.user_id as string
    const response = await this.userService.proactiveSubDisabled({ elderlyId })

    res.json({ response })
  }

  delete = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string

    const id = await this.userService.delete({ userId })
    res.json({ id })
  }

  deleteElderly = async (req: CustomRequest, res: Response) => {
    const { id }: { id: string } = req.body
    const userId = req.user?.user_id as string

    await this.userService.deleteElderly({ elderlyId: id, userId })
    res.json({ id })
  }
}

export { UsersController }
