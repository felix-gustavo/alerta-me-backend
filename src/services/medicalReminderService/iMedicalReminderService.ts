type MedicalReminder = {
  id: string
  medic_name: string
  specialty: string
  date: string
  address: string
}

type CreateMedicalReminderParams = {
  userId: string
} & Omit<MedicalReminder, 'id'>

type GetMedicalReminderParams = {
  userId: string
  withPast: boolean
}

type UpdateMedicalReminderParams = Partial<MedicalReminder> & {
  userId: string
  id: string
}

type DeleteMedicalReminderParams = {
  userId: string
  id: string
}

interface IMedicalReminderService {
  create(data: CreateMedicalReminderParams): Promise<MedicalReminder>
  get(data: GetMedicalReminderParams): Promise<MedicalReminder[] | null>
  update(data: UpdateMedicalReminderParams): Promise<MedicalReminder>
  delete(data: DeleteMedicalReminderParams): Promise<void>
}

export {
  IMedicalReminderService,
  CreateMedicalReminderParams,
  GetMedicalReminderParams,
  UpdateMedicalReminderParams,
  DeleteMedicalReminderParams,
  MedicalReminder,
}
