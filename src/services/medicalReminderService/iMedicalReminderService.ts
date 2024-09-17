import { INotifications } from '../iNotifications'

type MedicalReminder = {
  id: string
  medic_name: string
  specialty: string
  datetime: Date
  address: string
  active: boolean
  attended: boolean | null
}

type MedicalReminderParams = Omit<MedicalReminder, 'id'>

type CreateMedicalReminderStringParams = {
  userId: string
} & {
  [K in keyof MedicalReminderParams]: string
}

type GetMedicalReminderParams = {
  userId: string
  isPast: boolean
}

type UpdateMedicalReminderParams = Partial<{
  [K in keyof MedicalReminderParams]: string
}> & {
  userId: string
  id: string
}

type DeleteMedicalReminderParams = {
  userId: string
  id: string
}

interface IMedicalReminderService extends INotifications {
  create(data: CreateMedicalReminderStringParams): Promise<MedicalReminder>
  get(data: GetMedicalReminderParams): Promise<MedicalReminder[]>
  getToUpdate(data: { userId: string }): Promise<MedicalReminder[]>
  // getAllActives(data: { userId: string }): Promise<MedicalReminder[]>
  update(data: UpdateMedicalReminderParams): Promise<MedicalReminder>
  delete(data: DeleteMedicalReminderParams): Promise<void>
}

export {
  IMedicalReminderService,
  MedicalReminderParams,
  CreateMedicalReminderStringParams,
  GetMedicalReminderParams,
  UpdateMedicalReminderParams,
  DeleteMedicalReminderParams,
  MedicalReminder,
}
