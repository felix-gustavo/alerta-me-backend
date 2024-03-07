import { Response, Request } from 'express'
import { AuthService } from '../services/authService'

class AuthController {
  constructor(private readonly authService: AuthService) {}

  signIn = async (req: Request, res: Response) => {
    const { idToken }: { idToken: string } = req.body
    const response = await this.authService.signIn(idToken)
    res.json(response)
  }

  // refreshToken = async (req: Request, res: Response) => {
  //   const refreshToken = req.body.refreshToken
  //   return res.json(await this.authService.refreshToken(refreshToken))
  // }
}

export { AuthController }
