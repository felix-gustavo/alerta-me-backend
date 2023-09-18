interface Users {
  id: string
  name: string
  email: string
  is_elderly: boolean
}

interface IUsersService {
  create(data: Omit<Users, 'id'>): Promise<Users>
  isElderly(id: string): Promise<boolean>
  getById(id: string): Promise<Users | null>
  getByEmail(email: string): Promise<Users | null>
}

export { IUsersService, Users }
