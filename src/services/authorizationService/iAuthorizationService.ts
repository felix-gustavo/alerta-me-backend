import { Users } from '../usersService/iUsersService'

interface CreateAuthorizationParams {
  elderlyEmail: string
  userId: string
}

type UsersType = 'user' | 'elderly'

interface GetAuthorizationParams {
  usersTypeId: string
  usersType: UsersType
}

type AuthorizationStatus = 'aprovado' | 'aguardando' | 'negado'

interface Authorization {
  id: string
  elderly: Users
  status: AuthorizationStatus
  user: Users
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
}

export {
  CreateAuthorizationParams,
  GetAuthorizationParams,
  Authorization,
  UpdateAuthorizationParams,
  IAuthorizationService,
  AuthorizationStatus,
}
