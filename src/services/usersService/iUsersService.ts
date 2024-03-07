type UserProfile = {
  user_id: string
  name: string
  email: string
}

type Users = {
  id: string
  name: string
  email: string
  is_elderly: boolean
  ask_user_id: string | null
}

type UsersType = 'user' | 'elderly'

type CreateUsers = Omit<
  Omit<Users, 'ask_user_id' | 'permission_notification'> & {
    ask_user_id?: string | null
  },
  'id'
> & {
  id?: string
}

type UpdateParams = Partial<Users> & {
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
  create(data: CreateUsers): Promise<Users>
  getById(id: string): Promise<Users | null>
  getByEmailAndType({
    email,
    isElderly,
  }: GetByEmailAndTypeParams): Promise<Users | null>
  update(data: UpdateParams): Promise<string>
  delete(data: { userId: string }): Promise<string>
  deleteElderly(data: DeleteElderlyParams): Promise<void>
}

export {
  IUsersService,
  UserProfile,
  Users,
  UsersType,
  CreateUsers,
  UpdateParams,
  DeleteElderlyParams,
  GetByEmailAndTypeParams,
  NotificationsUser,
}
