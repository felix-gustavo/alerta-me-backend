import { Response, Request } from 'express'
import { IUsersService } from '../services/usersService/iUsersService'

class UserController {
  constructor(private readonly userService: IUsersService) {}

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

export { UserController }
