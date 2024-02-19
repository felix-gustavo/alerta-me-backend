import { Request, Response, NextFunction } from 'express'
import {
  SessionExpiredException,
  UnauthorizedException,
  WithoutTokenException,
} from '../exceptions'
import { UsersService } from '../services/usersService/usersService'
import { FirebaseError } from '@firebase/util'
import { auth } from 'firebase-admin'
import { UserProfile, Users } from '../services/usersService/iUsersService'
import axios, { AxiosError } from 'axios'

interface CustomRequest extends Request {
  user?: UserProfile
}

const decodeAmazonTokenMiddleware = async (
  req: CustomRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer '))
      throw new WithoutTokenException()

    const token = authorizationHeader.split('Bearer ')[1]
    const userData = (
      await axios.get('https://api.amazon.com/user/profile', {
        params: { access_token: token },
      })
    ).data as UserProfile

    req.user = userData
    next()
  } catch (error: unknown) {
    if ((error as AxiosError).response?.status === 400)
      throw new UnauthorizedException('Token inválido')

    throw error
  }
}

const decodeFirebaseTokenMiddleware = async (
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

    const user = await userService.getByEmailAndType({
      email: decodedToken.email ?? '',
      isElderly: false,
    })
    if (!user) throw new UnauthorizedException('Usuário não encontrado')

    req.user = {
      user_id: user.id,
      email: user.email,
      name: user.name,
    }
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

export {
  CustomRequest,
  decodeFirebaseTokenMiddleware,
  decodeAmazonTokenMiddleware,
}
