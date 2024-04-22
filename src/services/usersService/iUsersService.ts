type UserProfile = {
  user_id: string
  name: string
  email: string
}

type UserElderly = {
  id: string
  name: string
  email: string
  is_elderly: boolean
  ask_user_id: string | null
}

type UsersType = 'user' | 'elderly'

type CreateUsers = Omit<
  Omit<UserElderly, 'ask_user_id' | 'permission_notification'> & {
    ask_user_id?: string | null
  },
  'id'
> & {
  id?: string
}

type UpdateParams = Partial<UserElderly> & {
  id: string
  usersType: UsersType
}

type DeleteElderlyParams = {
  id: string
  userId: string
}

type GetByEmailAndTypeParams = {
  email: string
  isElderly: boolean
}

type NotificationsUser = {
  id: string
  type: 'medical_reminder' | 'medication_reminder' | 'water_reminder'
  message: string
}

interface IUsersService {
  createElderly(data: CreateUsers): Promise<UserElderly>
  getElderlyById(id: string): Promise<UserElderly | null>
  getById(id: string): Promise<UserProfile | null>
  getByEmailAndType({
    email,
    isElderly,
  }: GetByEmailAndTypeParams): Promise<UserElderly | null>
  update(data: UpdateParams): Promise<string>
  delete(data: { userId: string }): Promise<string>
  deleteElderly(data: DeleteElderlyParams): Promise<string>
}

export {
  IUsersService,
  UserProfile,
  UserElderly,
  UsersType,
  CreateUsers,
  UpdateParams,
  DeleteElderlyParams,
  GetByEmailAndTypeParams,
  NotificationsUser,
}
