type UserProfile = {
  user_id: string
  name: string
  email: string
}

type UserElderly = {
  id: string
  name: string
  email: string
  ask_user_id: string | null
}

type CreateUsers = Omit<
  Omit<UserElderly, 'ask_user_id'> & {
    ask_user_id?: string | null
  },
  'id'
> & {
  id?: string
}

type UpdateParams = Partial<UserElderly> & {
  id: string
}

type DeleteElderlyParams = {
  elderlyId: string
  userId: string
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
  getByEmail({ email }: { email: string }): Promise<UserElderly | null>
  update(data: UpdateParams): Promise<string>
  proactiveSubAccepted(data: {
    elderlyId: string
    ask_user_id: string
  }): Promise<string>
  proactiveSubDisabled(data: { elderlyId: string }): Promise<string>
  delete(data: { userId: string }): Promise<string>
  deleteElderly(data: DeleteElderlyParams): Promise<string>
}

export {
  IUsersService,
  UserProfile,
  UserElderly,
  CreateUsers,
  UpdateParams,
  DeleteElderlyParams,
  NotificationsUser,
}
