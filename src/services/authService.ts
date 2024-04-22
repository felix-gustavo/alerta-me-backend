import {
  IUsersService,
  UserProfile,
  UserElderly,
} from './usersService/iUsersService'
import { auth } from 'firebase-admin'

class AuthService {
  constructor(private readonly usersService: IUsersService) {}

  async signIn(idToken: string): Promise<UserElderly> {
    const decodedToken = await auth().verifyIdToken(idToken)

    let user = await this.usersService.getByEmailAndType({
      email: decodedToken.email ?? '',
      isElderly: false,
    })

    if (!user) {
      user = await this.usersService.createElderly({
        name: decodedToken.name ?? '',
        email: decodedToken.email ?? '',
        is_elderly: false,
      })
    }

    return user
  }

  async signInElderly({
    user_id,
    email,
    name,
  }: UserProfile): Promise<UserElderly> {
    const user = await this.usersService.createElderly({
      id: user_id,
      name,
      email,
      is_elderly: true,
    })

    return user
  }
}

export { AuthService }
