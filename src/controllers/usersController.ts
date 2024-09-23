import {
  IUsersService,
  UserProfile,
} from '../services/usersService/iUsersService'
import { Request, Response } from 'express'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'
import { NotFoundException } from '../exceptions/index'

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
      }),
    )
  }

  get = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string
    const isElderly = (req.query.isElderly as string | undefined) === 'true'

    const user = isElderly
      ? await this.userService.getElderlyById(userId)
      : await this.userService.getById(userId)
    if (user == null) throw new NotFoundException('Usuário não encontrado')
    res.json(user)
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

  delete = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string

    const id = await this.userService.delete({ userId })
    res.json({ id })
  }

  deleteElderly = async (req: CustomRequest, res: Response) => {
    const id = req.params.id as string
    const userId = req.user?.user_id as string

    await this.userService.deleteElderly({ elderlyId: id, userId })
    res.json({ id })
  }
}

export { UsersController }
