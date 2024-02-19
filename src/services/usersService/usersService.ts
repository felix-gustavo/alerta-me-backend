import { firestore } from 'firebase-admin'
import { FirebaseError } from '@firebase/util'
import {
  NotFoundException,
  UnauthorizedException,
  UnprocessableException,
  UserCreationException,
} from '../../exceptions'
import {
  CreateUsers,
  DeleteElderlyParams,
  GetByEmailAndTypeParams,
  IUsersService,
  UpdateParams,
  Users,
} from './iUsersService'
import { AuthorizationService } from '../authorizationService/authorizationService'

class UsersService implements IUsersService {
  private static instance: UsersService

  public static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService()
    }
    return UsersService.instance
  }

  async create(data: CreateUsers): Promise<Users> {
    try {
      const usersCollection = firestore().collection('users')
      const id = data.id
      delete data.id
      if (id) {
        await usersCollection.doc(id).set(data)
        return {
          ...data,
          id,
        }
      }

      const filteredData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === undefined ? null : value,
        ])
      )

      const docRef = await usersCollection.add(filteredData)
      return {
        ...data,
        id: docRef.id,
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) throw new UserCreationException()
      throw error
    }
  }

  async getByEmailAndType(
    params: GetByEmailAndTypeParams
  ): Promise<Users | null> {
    try {
      const userRef = firestore().collection('users')
      const query = userRef
        .where('email', '==', params.email)
        .where('is_elderly', '==', params.isElderly)

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
        const userData = docSnap.data() as Omit<Users, 'id'>
        return userData ? { ...userData, id } : null
      }

      return null
    } catch (error) {
      if (error instanceof FirebaseError && error.code == 'permission-denied') {
        throw new UnauthorizedException()
      }

      throw error
    }
  }

  async update(data: UpdateParams): Promise<string> {
    try {
      const authorizationService = new AuthorizationService(this)
      const authorization = await authorizationService.get({
        usersTypeId: data.id,
        usersType: data.usersType,
      })

      if (!authorization)
        throw new NotFoundException('Autorização não encontrada')

      const docSnap = await firestore().collection('users').doc(data.id).get()
      const docData = docSnap.data()

      if (!docData) throw new NotFoundException('Usuário não encontrado')

      const dataToUpdate = {
        name: data.name,
        email: data.email,
        is_elderly: data.is_elderly,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      }

      for (const key in dataToUpdate) {
        if (dataToUpdate[key as keyof typeof dataToUpdate] === null) {
          delete dataToUpdate[key as keyof typeof dataToUpdate]
        }
      }

      await docSnap.ref.update(dataToUpdate)

      return data.id
    } catch (error: unknown) {
      if (error instanceof FirebaseError) throw new UnprocessableException()
      throw error
    }
  }

  async delete({ userId }: { userId: string }): Promise<string> {
    try {
      const authorizationService = new AuthorizationService(this)
      const authorization = await authorizationService.get({
        usersTypeId: userId,
        usersType: 'user',
      })

      if (authorization) await authorizationService.delete({ userId })

      await firestore().collection('users').doc(userId).delete()
      return userId
    } catch (error: unknown) {
      if (error instanceof FirebaseError) throw new UnprocessableException()
      throw error
    }
  }

  async deleteElderly({ id, userId }: DeleteElderlyParams): Promise<void> {
    try {
      const authorizationService = new AuthorizationService(this)
      const authorization = await authorizationService.get({
        usersTypeId: id,
        usersType: 'elderly',
      })

      if (authorization?.user.id != userId)
        throw new UnauthorizedException(
          'Esse usuário não tem permissão para excluir esse usuário idoso'
        )

      await authorizationService.delete({ userId })

      const docRef = firestore().collection('users').doc(id)
      await firestore().recursiveDelete(docRef)
    } catch (error: unknown) {
      if (error instanceof FirebaseError) throw new UnprocessableException()
      throw error
    }
  }
}

export { UsersService }
