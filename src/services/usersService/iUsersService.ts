type Users = {
  id: string
  name: string
  email: string
  is_elderly: boolean
  refresh_token: string | null
}

type CreateUsers = Omit<Users, 'id'> & { id?: string }

interface IUsersService {
  create(data: CreateUsers): Promise<Users>
  isElderly(id: string): Promise<boolean>
  getById(id: string): Promise<Users | null>
  getByEmail(email: string): Promise<Users | null>
}

export { IUsersService, Users, CreateUsers }
