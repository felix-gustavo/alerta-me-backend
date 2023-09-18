import { Response, Request } from 'express'
import { AuthService } from '../services/authService'
import { CustomRequest } from '../middlewares/verifyTokenMiddleware'
import { UnauthorizedException } from '../exceptions'

class AuthController {
  constructor(private authService: AuthService) {}

  signIn = async (req: Request, res: Response) => {
    const { idToken }: { idToken: string } = req.body
    const isElderly = (req.query.isElderly as string | undefined) === 'true'

    console.log('idToken: ', idToken)

    const response = await this.authService.signIn({
      idToken: idToken,
      isElderly: isElderly,
    })

    res.json(response)
  }
}

export { AuthController }
