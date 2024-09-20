type CreateAuthorizationParams = {
  elderlyEmail: string
  userId: string
}

type AuthorizationStatus = 'aprovado' | 'aguardando'

type Authorization = {
  id: string
  elderly: string
  status: AuthorizationStatus
  user: string
  datetime: string
}

type UpdateAuthorizationParams = {
  id: string
  elderlyId: string
  status: AuthorizationStatus
}

interface IAuthorizationService {
  create(data: CreateAuthorizationParams): Promise<Authorization>
  getByElderly(data: { elderlyId: string }): Promise<Authorization | null>
  getByUser(data: { userId: string }): Promise<Authorization | null>
  updateStatus(data: UpdateAuthorizationParams): Promise<void>
  delete(data: { userId: string }): Promise<string>
  checkIsAuthorized(data: { userId: string }): Promise<Authorization>
}

export type {
  CreateAuthorizationParams,
  Authorization,
  UpdateAuthorizationParams,
  IAuthorizationService,
  AuthorizationStatus,
}
