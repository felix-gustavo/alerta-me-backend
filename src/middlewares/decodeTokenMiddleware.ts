import { NextFunction, Request, Response } from 'express'
import {
  SessionExpiredException,
  UnauthorizedException,
  WithoutTokenException,
} from '../exceptions/index.ts'
import axios, { AxiosError } from 'axios'
import { FirebaseError } from 'firebase-admin/lib/utils/error'
import { UserProfile } from '../services/usersService/iUsersService.ts'
import { getAuth } from 'firebase-admin/auth'

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
    return next()
  } catch (error: unknown) {
    if ((error as AxiosError).response?.status === 400)
      throw new UnauthorizedException('Token inválido')

    return next(error)
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
    const decodedToken = await getAuth().verifyIdToken(token)

    req.user = {
      user_id: decodedToken.uid,
      name: decodedToken.name,
      email: decodedToken.email ?? '',
    }

    return next()
  } catch (error: unknown) {
    switch ((error as FirebaseError)?.code) {
      case 'auth/argument-error':
        throw new UnauthorizedException('Token inválido')
      case 'auth/id-token-expired':
        throw new SessionExpiredException()
    }

    return next(error)
  }
}

export {
  CustomRequest,
  decodeFirebaseTokenMiddleware,
  decodeAmazonTokenMiddleware,
}
