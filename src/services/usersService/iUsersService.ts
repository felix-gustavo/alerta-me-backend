type Users = {
  id: string
  name: string
  email: string
  is_elderly: boolean
  refresh_token: string | null
}

type CreateUsers = Omit<Users, 'id'> & { id?: string }

type DeleteElderlyParams = {
  id: string
  userId: string
}

type GetByEmailAndTypeParams = {
  email: string
  isElderly: boolean
}
interface IUsersService {
  create(data: CreateUsers): Promise<Users>
  getById(id: string): Promise<Users | null>
  getByEmailAndType({
    email,
    isElderly,
  }: GetByEmailAndTypeParams): Promise<Users | null>
  delete(data: { userId: string }): Promise<string>
  deleteElderly(data: DeleteElderlyParams): Promise<void>
}

export {
  IUsersService,
  Users,
  CreateUsers,
  DeleteElderlyParams,
  GetByEmailAndTypeParams,
}
