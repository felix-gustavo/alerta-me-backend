import { Response, Request } from 'express'
import { AuthService } from '../services/authService'

class AuthController {
  constructor(private readonly authService: AuthService) {}

  signIn = async (req: Request, res: Response) => {
    const { idToken }: { idToken: string } = req.body
    const response = await this.authService.signIn(idToken)
    res.json(response)
  }

  signInElderly = async (req: Request, res: Response) => {
    console.log('req.body: ', req.body)
    const redirectUri = req.body.redirect_uri
    const clientId = req.body.client_id
    const code = req.body.code
    const grantType = req.body.grant_type

    const authorizationHeader = req.headers.authorization

    if (!authorizationHeader)
      return res.status(400).send('Cabeçalho de autorização ausente')

    const response = await this.authService.signInElderly({
      redirectUri,
      clientId,
      code,
      grantType,
      authorization: authorizationHeader,
    })

    return res.json(response)
  }

  refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken
    return res.json(await this.authService.refreshToken(refreshToken))
  }
}

export { AuthController }
