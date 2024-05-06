import {
  IUsersService,
  UserProfile,
  UserElderly,
} from './usersService/iUsersService'

class AuthService {
  constructor(private readonly usersService: IUsersService) {}

  async signInElderly({
    user_id,
    email,
    name,
  }: UserProfile): Promise<UserElderly> {
    const user = await this.usersService.createElderly({
      id: user_id,
      name,
      email,
    })

    return user
  }
}

export { AuthService }
