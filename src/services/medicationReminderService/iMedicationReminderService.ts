enum DayOfWeek {
  Sun = 'sun',
  Mon = 'mon',
  Tue = 'tue',
  Wed = 'wed',
  Thu = 'thu',
  Fri = 'fri',
  Sat = 'sat',
}

type Dose = {
  [key in DayOfWeek]: Dosage[] | null
}

type Dosage = {
  time: number
  amount: number
}

type MedicationReminder = {
  id: string
  name: string
  dosage_unit: string
  dosage_pronunciation: string
  comments?: string
  dose: Dose
}

type CreateMedicationReminderParams = {
  userId: string
} & Omit<MedicationReminder, 'id'>

type GetMedicationReminderParams = {
  userId: string
}

type UpdateMedicationReminderParams = Partial<MedicationReminder> & {
  userId: string
  id: string
}

interface IMedicationReminderService {
  create(data: CreateMedicationReminderParams): Promise<MedicationReminder>
  get(data: GetMedicationReminderParams): Promise<MedicationReminder[] | null>
  update(data: UpdateMedicationReminderParams): Promise<MedicationReminder>
}

export {
  IMedicationReminderService,
  CreateMedicationReminderParams,
  GetMedicationReminderParams,
  UpdateMedicationReminderParams,
  MedicationReminder,
  DayOfWeek,
  Dose,
  Dosage,
}
