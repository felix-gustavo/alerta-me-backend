import { Request, Response, NextFunction } from 'express'
import {
  SessionExpiredException,
  UnauthorizedException,
  WithoutTokenException,
} from '../exceptions'
import { UsersService } from '../services/usersService/usersService'
import { FirebaseError } from '@firebase/util'
import { auth } from 'firebase-admin'
import { Users } from '../services/usersService/iUsersService'
import axios, { AxiosError } from 'axios'

const getEmailByToken = async (accessToken: string) => {
  const profileResponse = await axios.get(
    'https://api.amazon.com/user/profile',
    { params: { access_token: accessToken } }
  )

  return profileResponse.data.email
}

interface CustomRequest extends Request {
  user?: Users
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
    const email = await getEmailByToken(token)

    const userService = UsersService.getInstance()

    const user = await userService.getByEmailAndType({
      email: email ?? '',
      isElderly: true,
    })
    if (!user) throw new UnauthorizedException('Usuário não encontrado')

    req.user = user
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

export {
  CustomRequest,
  decodeFirebaseTokenMiddleware,
  decodeAmazonTokenMiddleware,
}
