import { Response, Request } from 'express'
import { AuthService } from '../services/authService'
import axios from 'axios'

class AuthController {
  constructor(private readonly authService: AuthService) {}

  signIn = async (req: Request, res: Response) => {
    const { idToken }: { idToken: string } = req.body
    const response = await this.authService.signIn(idToken)
    res.json(response)
  }

  signInElderly = async (req: Request, res: Response) => {
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

    const clientId = process.env.CLIENTE_ID
    const clientSecret = process.env.CLIENTE_SECRET

    const response = await axios.post(
      `https://api.amazon.com/auth/o2/token?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}`,
      null
    )
    return res.json(response.data)
  }
}

export { AuthController }
