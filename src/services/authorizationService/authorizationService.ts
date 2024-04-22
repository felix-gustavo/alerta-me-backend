import {
  AuthorizationCreationException,
  NotFoundException,
  NotIsElderlyException,
  UnauthorizedException,
  UnprocessableException,
} from '../../exceptions'
import { IUsersService } from '../usersService/iUsersService'
import {
  Authorization,
  CreateAuthorizationParams,
  GetAuthorizationParams,
  IAuthorizationService,
  UpdateAuthorizationParams,
  AuthorizationStatus,
} from './iAuthorizationService'
import { firestore } from 'firebase-admin'
import { FirebaseError } from '@firebase/util'

class AuthorizationService implements IAuthorizationService {
  constructor(private readonly usersService: IUsersService) {}

  async create({
    elderlyEmail,
    userId,
  }: CreateAuthorizationParams): Promise<Authorization> {
    const elderlyUser = await this.usersService.getByEmailAndType({
      email: elderlyEmail,
      isElderly: true,
    })

    if (!elderlyUser) throw new NotFoundException('Idoso não encontrado')
    if (!elderlyUser.is_elderly) throw new NotIsElderlyException()

    const data = {
      user: userId,
      elderly: elderlyUser.id,
      status: 'aguardando',
    } as Omit<Authorization, 'id'>

    const docRef = await firestore().collection('authorizations').add(data)
    return {
      id: docRef.id,
      ...data,
    }
  }

  async get({
    usersTypeId,
    usersType,
  }: GetAuthorizationParams): Promise<Authorization | null> {
    const myQuery = firestore()
      .collection('authorizations')
      .where(usersType, '==', usersTypeId)

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
    usersType,
    usersTypeId,
  }: UpdateAuthorizationParams): Promise<void> {
    const docRef = firestore().collection('authorizations').doc(id)
    const docSnap = await docRef.get()
    if (!docSnap.exists) throw new NotFoundException('Documento não encontrado')

    if (docSnap.data()?.[usersType] !== usersTypeId)
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
