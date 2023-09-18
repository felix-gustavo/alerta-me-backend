import { SessionExpiredException } from '../exceptions'
import { IUsersService, Users } from './usersService/iUsersService'
import { auth } from 'firebase-admin'

type SignInParams = {
  idToken: string
  isElderly: boolean
}

class AuthService {
  constructor(private readonly usersService: IUsersService) {}

  async signIn({ idToken, isElderly }: SignInParams): Promise<Users> {
    try {
      const decodedToken = await auth().verifyIdToken(idToken)

      let user = await this.usersService.getByEmail(decodedToken.email ?? '')

      console.log('user: ', user?.email)

      if (!user) {
        user = await this.usersService.create({
          name: decodedToken['name'] ?? '',
          email: decodedToken.email ?? '',
          is_elderly: isElderly,
        })
      }

      return user
    } catch (error) {
      throw new SessionExpiredException()
    }
  }
}

export { AuthService }
