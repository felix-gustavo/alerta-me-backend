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

    try {
      const data = {
        user: userId,
        elderly: elderlyUser.id,
        status: 'aguardando',
      }

      const docRef = await firestore().collection('authorizations').add(data)

      const elderly = await this.usersService.getById(data.elderly)
      if (!elderly) throw new NotFoundException('Idoso não encontrado')

      const user = await this.usersService.getById(data.user)
      if (!user) throw new NotFoundException('Usuário não encontrado')

      return {
        id: docRef.id,
        elderly,
        status: data.status as AuthorizationStatus,
        user,
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError)
        throw new AuthorizationCreationException()

      throw error
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

    const elderly = await this.usersService.getById(docData.elderly)
    if (!elderly) throw new NotFoundException('Idoso não encontrado')

    const user = await this.usersService.getById(docData.user)
    if (!user) throw new NotFoundException('Usuário não encontrado')

    return {
      id: queryDocumentSnapshot.id,
      elderly,
      status: docData.status,
      user,
    }
  }

  async updateStatus({
    id,
    status,
    usersType,
    usersTypeId,
  }: UpdateAuthorizationParams): Promise<void> {
    try {
      const docRef = firestore().collection('authorizations').doc(id)
      const docSnap = await docRef.get()
      if (!docSnap.exists)
        throw new NotFoundException('Documento não encontrado')

      if (docSnap.data()?.[usersType] !== usersTypeId)
        throw new UnauthorizedException(
          'O usuário não tem permissão para editar esse documento'
        )

      await docRef.update({ status })
    } catch (error) {
      if (error instanceof FirebaseError) throw new UnprocessableException()

      throw error
    }
  }

  async delete({ userId }: { userId: string }): Promise<string> {
    try {
      const myQuery = firestore()
        .collection('authorizations')
        .where('user', '==', userId)

      const snapshot = await myQuery.get()
      if (snapshot.empty)
        throw new NotFoundException('Documento não encontrado')

      const queryDocumentSnapshot = snapshot.docs[0]
      const id = queryDocumentSnapshot.id
      await queryDocumentSnapshot.ref.delete()
      return id
    } catch (error) {
      if (error instanceof FirebaseError) throw new UnprocessableException()

      throw error
    }
  }
}

export { AuthorizationService }
