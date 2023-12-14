import { Response, Request } from 'express'
import {
  CreateUsers,
  IUsersService,
} from '../services/usersService/iUsersService'

class UsersController {
  constructor(private readonly userService: IUsersService) {}

  create = async (req: Request, res: Response) => {
    const data: CreateUsers = req.body

    res.json(
      await this.userService.create({
        id: data.id,
        name: data.name,
        email: data.email,
        is_elderly: data.is_elderly,
        refresh_token: data.refresh_token ?? null,
      })
    )
  }

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    res.json(await this.userService.getById(id))
  }

  getByEmail = async (req: Request, res: Response) => {
    const email = req.params.email as string
    res.json(await this.userService.getByEmail(email))
  }

  isElderly = async (req: Request, res: Response) => {
    const email = req.params.email as string
    res.json(await this.userService.isElderly(email))
  }
}

export { UsersController }
