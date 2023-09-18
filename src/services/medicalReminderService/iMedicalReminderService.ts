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

interface IMedicalReminderService {
  create(data: CreateMedicalReminderParams): Promise<MedicalReminder>
  get(data: GetMedicalReminderParams): Promise<MedicalReminder[] | null>
  update(data: UpdateMedicalReminderParams): Promise<MedicalReminder>
}

export {
  IMedicalReminderService,
  CreateMedicalReminderParams,
  GetMedicalReminderParams,
  UpdateMedicalReminderParams,
  MedicalReminder,
}
