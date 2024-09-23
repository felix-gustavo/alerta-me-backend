import {
  Authorization,
  AuthorizationStatus,
  CreateAuthorizationParams,
  IAuthorizationService,
  UpdateAuthorizationParams,
} from './iAuthorizationService'
import {
  NotFoundException,
  UnauthorizedException,
  UnprocessableException,
} from '../../exceptions/index'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { IUsersService } from '../usersService/iUsersService'

class AuthorizationService implements IAuthorizationService {
  constructor(private readonly usersService: IUsersService) {}

  async create({
    elderlyEmail: email,
    userId,
  }: CreateAuthorizationParams): Promise<Authorization> {
    const elderlyUser = await this.usersService.getByEmail({ email })
    if (!elderlyUser) throw new NotFoundException('Idoso não encontrado')

    const authorization = await this.getByElderly({ elderlyId: elderlyUser.id })
    if (authorization?.status === 'aprovado')
      throw new UnprocessableException('Usuário idoso já possui um cuidador')

    const status: AuthorizationStatus = 'aguardando'

    const data = {
      user: userId,
      elderly: elderlyUser.id,
      status,
      datetime: new Date(),
    }

    const docRef = await getFirestore().collection('authorizations').add(data)
    return {
      id: docRef.id,
      datetime: data.datetime.toISOString(),
      elderly: data.elderly,
      user: data.user,
      status,
    }
  }

  async getByElderly({
    elderlyId,
  }: {
    elderlyId: string
  }): Promise<Authorization | null> {
    const query = getFirestore()
      .collection('authorizations')
      .orderBy('datetime', 'desc')
      .where('elderly', '==', elderlyId)

    const snapshot = await query.get()
    if (snapshot.empty) return null

    const queryDocumentSnapshot = snapshot.docs[0]
    const data = queryDocumentSnapshot.data()

    return {
      id: queryDocumentSnapshot.id,
      elderly: data.elderly,
      status: data.status,
      user: data.user,
      datetime: (data.datetime as Timestamp).toDate().toISOString(),
    } as Authorization
  }

  async getByUser({
    userId,
  }: {
    userId: string
  }): Promise<Authorization | null> {
    const query = getFirestore()
      .collection('authorizations')
      .where('user', '==', userId)

    const snapshot = await query.get()
    if (snapshot.empty) return null

    const queryDocumentSnapshot = snapshot.docs[0]
    const data = queryDocumentSnapshot.data()

    return {
      id: queryDocumentSnapshot.id,
      elderly: data.elderly,
      status: data.status,
      user: data.user,
      datetime: (data.datetime as Timestamp).toDate().toISOString(),
    } as Authorization
  }

  async updateStatus({
    id,
    status,
    elderlyId,
  }: UpdateAuthorizationParams): Promise<void> {
    const docRef = getFirestore().collection('authorizations').doc(id)
    const docSnap = await docRef.get()
    if (!docSnap.exists) throw new NotFoundException('Documento não encontrado')

    const docData = docSnap.data() as Omit<Authorization, 'id'> | undefined

    if (docData != undefined && docData.elderly !== elderlyId)
      throw new UnauthorizedException(
        'O usuário não tem permissão para editar esse documento',
      )

    await docRef.update({ status })
  }

  async delete({ userId }: { userId: string }): Promise<string> {
    const query = getFirestore()
      .collection('authorizations')
      .where('user', '==', userId)

    const snapshot = await query.get()
    if (snapshot.empty) throw new NotFoundException('Documento não encontrado')

    const queryDocumentSnapshot = snapshot.docs[0]
    const id = queryDocumentSnapshot.id
    await queryDocumentSnapshot.ref.delete()
    return id
  }

  async checkIsAuthorized({
    userId,
  }: {
    userId: string
  }): Promise<Authorization> {
    const authorization = await this.getByUser({ userId })
    if (!authorization || authorization.status === 'aguardando')
      throw new UnauthorizedException()

    return authorization
  }
}

export { AuthorizationService }
