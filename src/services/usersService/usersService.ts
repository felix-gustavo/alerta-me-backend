import { firestore } from 'firebase-admin'
import { FirebaseError } from '@firebase/util'
import {
  NotFoundException,
  UnauthorizedException,
  UserCreationException,
} from '../../exceptions'
import { IUsersService, Users } from './iUsersService'

class UsersService implements IUsersService {
  private static instance: UsersService

  public static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService()
    }
    return UsersService.instance
  }

  async create(data: Omit<Users, 'id'>): Promise<Users> {
    try {
      const docRef = await firestore().collection('users').add(data)
      return {
        ...data,
        id: docRef.id,
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) throw new UserCreationException()
      throw error
    }
  }

  async getByEmail(email: string): Promise<Users | null> {
    try {
      const userRef = firestore().collection('users')
      const query = userRef.where('email', '==', email)
      const snapshot = await query.get()
      if (snapshot.empty) return null

      const firstDoc = snapshot.docs[0]
      const userData = firstDoc.data() as Omit<Users, 'id'>

      return {
        ...userData,
        id: firstDoc.id,
      }
    } catch (error) {
      if (error instanceof FirebaseError && error.code == 'permission-denied') {
        throw new UnauthorizedException()
      }

      throw error
    }
  }

  async getById(id: string): Promise<Users | null> {
    try {
      const docRef = firestore().collection('users').doc(id)
      const docSnap = await docRef.get()

      if (docSnap.exists) {
        const data = docSnap.data() as Omit<Users, 'id'>
        return data ? { ...data, id } : null
      }

      return null
    } catch (error) {
      if (error instanceof FirebaseError && error.code == 'permission-denied') {
        throw new UnauthorizedException()
      }

      throw error
    }
  }

  async isElderly(email: string): Promise<boolean> {
    try {
      const user = await this.getByEmail(email)
      if (user == null) throw new NotFoundException('Usuário não encontrado')

      return user.is_elderly
    } catch (error) {
      if (error instanceof FirebaseError && error.code == 'permission-denied') {
        throw new UnauthorizedException()
      }

      throw error
    }
  }
}

export { UsersService }
