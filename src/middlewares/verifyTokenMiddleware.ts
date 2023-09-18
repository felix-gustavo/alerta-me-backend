import { Request, Response, NextFunction } from 'express'
import {
  SessionExpiredException,
  UnauthorizedException,
  WithoutTokenException,
} from '../exceptions'
import { UsersService } from '../services/usersService/usersService'
import { Users } from '../services/usersService/iUsersService'
import { FirebaseError } from '@firebase/util'
import { auth } from 'firebase-admin'

interface CustomRequest extends Request {
  user?: Users
}

const verifyTokenMiddleware = async (
  req: CustomRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers.authorization

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer '))
      throw new WithoutTokenException()

    const token = authorizationHeader.split('Bearer ')[1]

    const decodedToken = await auth().verifyIdToken(token)

    const userService = UsersService.getInstance()

    const user = await userService.getByEmail(decodedToken.email ?? '')
    if (!user) throw new UnauthorizedException('Usuário não encontrado')

    req.user = user
    next()
  } catch (error: unknown) {
    switch ((error as FirebaseError)?.code) {
      case 'auth/argument-error':
        throw new UnauthorizedException('Token inválido')
      case 'auth/id-token-expired':
        throw new SessionExpiredException()
    }

    throw error
  }
}

export { verifyTokenMiddleware, CustomRequest }
