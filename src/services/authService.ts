import axios from 'axios'
import { SessionExpiredException, UnprocessableException } from '../exceptions'
import { IUsersService, Users } from './usersService/iUsersService'
import { auth } from 'firebase-admin'

type SignInElderlyParams = {
  redirectUri: string
  clientId: string
  code: string
  grantType: string
  authorization: string
}

type TokenResponse = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

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
          refresh_token: null,
        })
      }

      return user
    } catch (error) {
      throw new SessionExpiredException()
    }
  }

  async signInElderly({
    authorization,
    clientId,
    code,
    grantType,
    redirectUri,
  }: SignInElderlyParams): Promise<TokenResponse> {
    try {
      const decodedCredentials = Buffer.from(
        authorization.split(' ')[1],
        'base64'
      ).toString('utf-8')
      const [, clientSecretFromHeader] = decodedCredentials.split(':')

      const tokenResponse = await axios.post(
        'https://api.amazon.com/auth/o2/token',
        null,
        {
          params: {
            grant_type: grantType,
            client_id: clientId,
            client_secret: clientSecretFromHeader,
            redirect_uri: redirectUri,
            code: code,
          },
        }
      )

      const accessToken = tokenResponse.data.access_token
      const refreshToken = tokenResponse.data.refresh_token

      const profileResponse = await axios.get(
        'https://api.amazon.com/user/profile',
        { params: { access_token: accessToken } }
      )

      const { email, name, user_id } = profileResponse.data

      await this.usersService.create({
        id: user_id,
        name,
        email,
        is_elderly: true,
        refresh_token: refreshToken,
      })
      return tokenResponse.data
    } catch (error) {
      throw new UnprocessableException()
    }
  }
}

export { AuthService }
