import axios, { AxiosError } from 'axios'
import { SessionExpiredException, UnprocessableException } from '../exceptions'
import { IUsersService, UserProfile, Users } from './usersService/iUsersService'
import { auth } from 'firebase-admin'

class AuthService {
  constructor(private readonly usersService: IUsersService) {}

  async signIn(idToken: string): Promise<Users> {
    try {
      const decodedToken = await auth().verifyIdToken(idToken)

      let user = await this.usersService.getByEmailAndType({
        email: decodedToken.email ?? '',
        isElderly: false,
      })

      if (!user) {
        user = await this.usersService.create({
          name: decodedToken['name'] ?? '',
          email: decodedToken.email ?? '',
          is_elderly: false,
        })
      }

      return user
    } catch (error) {
      throw new SessionExpiredException()
    }
  }

  async signInElderly({ user_id, email, name }: UserProfile): Promise<Users> {
    try {
      const user = await this.usersService.create({
        id: user_id,
        name,
        email,
        is_elderly: true,
      })
      return user
    } catch (error) {
      console.log(
        'error response headers: ',
        JSON.stringify((error as AxiosError).response?.headers)
      )
      console.log(
        'error response config.url: ',
        JSON.stringify((error as AxiosError).response?.config.url)
      )
      console.log(
        'error response data: ',
        JSON.stringify((error as AxiosError).response?.data)
      )
      throw new UnprocessableException()
    }
  }

  // async refreshToken(refreshToken: string): Promise<TokenResponse> {
  //   const clientId = process.env.LWA_CLIENTE_ID
  //   const clientSecret = process.env.LWA_CLIENTE_SECRET

  //   const response = await axios.post(
  //     `https://api.amazon.com/auth/o2/token?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}`,
  //     null
  //   )

  //   return response.data
  // }
}

export { AuthService }
