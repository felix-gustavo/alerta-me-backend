import { Response, Request } from 'express'
import {
  CreateUsers,
  IUsersService,
} from '../services/usersService/iUsersService'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'
import { UnauthorizedException, WithoutTokenException } from '../exceptions'

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
        access_token: data.access_token ?? null,
        ask_user_id: null,
      })
    )
  }

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    res.json(await this.userService.getById(id))
  }

  getByEmailAndType = async (req: Request, res: Response) => {
    const email = req.params.email as string
    const isElderly = (req.query.isElderly as string | undefined) === 'true'

    res.json(
      await this.userService.getByEmailAndType({
        email,
        isElderly,
      })
    )
  }

  proactiveSubAccepted = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id
    if (!userId) throw new WithoutTokenException()

    const data: { ask_user_id: string } = req.body

    await this.userService.update({
      id: userId,
      usersType: 'elderly',
      ask_user_id: data.ask_user_id,
    })

    res.json({ userId })
  }

  proactiveSubDisabled = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id
    if (!userId) throw new WithoutTokenException()

    await this.userService.update({
      id: userId,
      usersType: 'elderly',
      ask_user_id: null,
    })

    res.json({ userId })
  }

  delete = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id
    if (!userId) throw new UnauthorizedException()

    const id = await this.userService.delete({ userId })
    res.json({ id })
  }

  deleteElderly = async (req: CustomRequest, res: Response) => {
    const { id }: { id: string } = req.body

    const userId = req.user?.user_id
    if (!userId) throw new UnauthorizedException()

    await this.userService.deleteElderly({ id, userId })
    res.json({ id })
  }
}

export { UsersController }
