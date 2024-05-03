import { Response, Request } from 'express'
import {
  CreateUsers,
  IUsersService,
  UserProfile,
  UserElderly,
} from '../services/usersService/iUsersService'
import { CustomRequest } from '../middlewares/decodeTokenMiddleware'
import {
  NotFoundException,
  UnauthorizedException,
  UnprocessableException,
  WithoutTokenException,
} from '../exceptions'

class UsersController {
  constructor(private readonly userService: IUsersService) {}

  // create = async (req: Request, res: Response) => {
  //   const data: CreateUsers = req.body

  //   res.json(
  //     await this.userService.create({
  //       id: data.id,
  //       name: data.name,
  //       email: data.email,
  //       is_elderly: data.is_elderly,
  //       ask_user_id: data.ask_user_id ?? null,
  //     })
  //   )
  // }

  createElderly = async (req: CustomRequest, res: Response) => {
    const user = req.user as UserProfile

    res.json(
      await this.userService.createElderly({
        id: user.user_id,
        name: user.name,
        email: user.email,
        is_elderly: true,
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

  // accountLinked = async (req: CustomRequest, res: Response) => {
  //   const userId = req.user?.user_id
  //   if (!userId) throw new WithoutTokenException()

  //   await this.userService.update({
  //     id: userId,
  //     ask_user_id: req.body.ask_user_id,
  //   })

  //   res.json({ userId })
  // }

  proactiveSubAccepted = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string

    await this.userService.update({
      id: userId,
      ask_user_id: req.body.ask_user_id,
    })

    res.json({ userId })
  }

  proactiveSubDisabled = async (req: CustomRequest, res: Response) => {
    const userId = req.user?.user_id as string

    await this.userService.update({
      id: userId,
      ask_user_id: null,
    })

    res.json({ userId })
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
