import { UsersType } from '../usersService/iUsersService'

interface CreateAuthorizationParams {
  elderlyEmail: string
  userId: string
}

interface GetAuthorizationParams {
  usersTypeId: string
  usersType: UsersType
}

type AuthorizationStatus = 'aprovado' | 'aguardando' | 'negado'

interface Authorization {
  id: string
  elderly: string
  status: AuthorizationStatus
  user: string
}

type UpdateAuthorizationParams = {
  id: string
  usersTypeId: string
  usersType: UsersType
  status: AuthorizationStatus
}

interface IAuthorizationService {
  create(data: CreateAuthorizationParams): Promise<Authorization>
  get(data: GetAuthorizationParams): Promise<Authorization | null>
  updateStatus(data: UpdateAuthorizationParams): Promise<void>
  delete(data: { userId: string }): Promise<string>
}

export {
  CreateAuthorizationParams,
  GetAuthorizationParams,
  Authorization,
  UpdateAuthorizationParams,
  IAuthorizationService,
  AuthorizationStatus,
}
