import { getFirestore } from 'firebase-admin/firestore'
import { NotFoundException, UnauthorizedException } from '../../exceptions'
import {
  CreateUsers,
  DeleteElderlyParams,
  IUsersService,
  UpdateParams,
  UserElderly,
  UserProfile,
} from './iUsersService'
import { AuthorizationService } from '../authorizationService/authorizationService'
import { getAuth } from 'firebase-admin/auth'

class UsersService implements IUsersService {
  private static instance: UsersService

  public static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService()
    }
    return UsersService.instance
  }

  async createElderly(data: CreateUsers): Promise<UserElderly> {
    const usersCollection = getFirestore().collection('users')
    const id = data.id
    delete data.id

    if (id) {
      if (data.ask_user_id === undefined) delete data.ask_user_id
      await usersCollection.doc(id).set(data)
      const userData = await usersCollection.doc(id).get()
      return userData.data() as UserElderly
    }

    const filteredData = { ...data }

    for (const key in filteredData) {
      if (filteredData[key as keyof typeof filteredData] === undefined) {
        delete filteredData[key as keyof typeof filteredData]
      }
    }

    const docRef = await usersCollection.add(filteredData)
    const userData = await docRef.get()

    return userData.data() as UserElderly
  }

  async getByEmail({ email }: { email: string }): Promise<UserElderly | null> {
    const snapshot = await getFirestore()
      .collection('users')
      .where('email', '==', email)
      .get()

    if (snapshot.empty) return null

    const firstDoc = snapshot.docs[0]
    const userData = firstDoc.data() as Omit<UserElderly, 'id'>

    return {
      ...userData,
      id: firstDoc.id,
    }
  }

  async getElderlyById(id: string): Promise<UserElderly | null> {
    const docRef = getFirestore().collection('users').doc(id)
    const docSnap = await docRef.get()

    if (docSnap.exists) {
      const userData = docSnap.data() as Omit<UserElderly, 'id'>
      return userData ? { ...userData, id } : null
    }

    return null
  }

  async getById(id: string): Promise<UserProfile | null> {
    const user = await getAuth().getUser(id)
    if (user.displayName == undefined || user.email == undefined) {
      return null
    }

    return {
      user_id: id,
      name: user.displayName,
      email: user.email,
    }
  }

  async update(data: UpdateParams): Promise<string> {
    const docSnap = await getFirestore().collection('users').doc(data.id).get()
    const docData = docSnap.data()

    if (!docData) throw new NotFoundException('Usuário não encontrado')

    const dataToUpdate = {
      name: data.name,
      email: data.email,
      ask_user_id: data.ask_user_id,
    }

    for (const key in dataToUpdate) {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
        delete dataToUpdate[key as keyof typeof dataToUpdate]
      }
    }

    await docSnap.ref.update(dataToUpdate)
    return data.id
  }

  async delete({ userId }: { userId: string }): Promise<string> {
    const authorizationService = new AuthorizationService(this)
    await authorizationService.delete({ userId }).catch()
    await getAuth().deleteUser(userId)
    return userId
  }

  async deleteElderly({
    elderlyId,
    userId,
  }: DeleteElderlyParams): Promise<string> {
    const authorizationService = new AuthorizationService(this)
    const authorization = await authorizationService.getByElderly({ elderlyId })

    if (
      authorization == null ||
      authorization.user != userId ||
      authorization.status !== 'aprovado'
    ) {
      throw new UnauthorizedException(
        'Usuário não tem permissão para excluir o usuário idoso fornecido'
      )
    }
    await authorizationService.delete({ userId })

    const docRef = getFirestore().collection('users').doc(elderlyId)
    await getFirestore().recursiveDelete(docRef)

    return elderlyId
  }
}

export { UsersService }
