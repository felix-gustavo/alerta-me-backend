import { NotFoundException, UnauthorizedException } from '../../exceptions'
import { IUsersService } from '../usersService/iUsersService'
import {
  Authorization,
  CreateAuthorizationParams,
  IAuthorizationService,
  UpdateAuthorizationParams,
} from './iAuthorizationService'
import { firestore } from 'firebase-admin'

class AuthorizationService implements IAuthorizationService {
  constructor(private readonly usersService: IUsersService) {}

  async create({
    elderlyEmail: email,
    userId,
  }: CreateAuthorizationParams): Promise<Authorization> {
    const elderlyUser = await this.usersService.getByEmail({ email })

    if (!elderlyUser) throw new NotFoundException('Idoso não encontrado')

    const data: Omit<Authorization, 'id'> = {
      user: userId,
      elderly: elderlyUser.id,
      status: 'aguardando',
    }
    const docRef = await firestore().collection('authorizations').add(data)
    return {
      ...data,
      id: docRef.id,
    }
  }

  async getByElderly({
    elderlyId,
  }: {
    elderlyId: string
  }): Promise<Authorization | null> {
    const myQuery = firestore()
      .collection('authorizations')
      .where('elderly', '==', elderlyId)

    const snapshot = await myQuery.get()
    if (snapshot.empty) return null

    const queryDocumentSnapshot = snapshot.docs[0]
    const docData = queryDocumentSnapshot.data()

    return {
      id: queryDocumentSnapshot.id,
      elderly: docData.elderly,
      status: docData.status,
      user: docData.user,
    }
  }

  async getByUser({
    userId,
  }: {
    userId: string
  }): Promise<Authorization | null> {
    const myQuery = firestore()
      .collection('authorizations')
      .where('user', '==', userId)

    const snapshot = await myQuery.get()
    if (snapshot.empty) return null

    const queryDocumentSnapshot = snapshot.docs[0]
    const docData = queryDocumentSnapshot.data()

    return {
      id: queryDocumentSnapshot.id,
      elderly: docData.elderly,
      status: docData.status,
      user: docData.user,
    }
  }

  async updateStatus({
    id,
    status,
    elderlyId,
  }: UpdateAuthorizationParams): Promise<void> {
    const docRef = firestore().collection('authorizations').doc(id)
    const docSnap = await docRef.get()
    if (!docSnap.exists) throw new NotFoundException('Documento não encontrado')

    const docData = docSnap.data() as Omit<Authorization, 'id'> | undefined

    if (docData != undefined && docData.elderly !== elderlyId)
      throw new UnauthorizedException(
        'O usuário não tem permissão para editar esse documento'
      )

    await docRef.update({ status })
  }

  async delete({ userId }: { userId: string }): Promise<string> {
    const myQuery = firestore()
      .collection('authorizations')
      .where('user', '==', userId)

    const snapshot = await myQuery.get()
    if (snapshot.empty) throw new NotFoundException('Documento não encontrado')

    const queryDocumentSnapshot = snapshot.docs[0]
    const id = queryDocumentSnapshot.id
    await queryDocumentSnapshot.ref.delete()
    return id
  }
}

export { AuthorizationService }
