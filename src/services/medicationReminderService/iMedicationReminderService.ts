enum DayOfWeek {
  Sun = 'sun',
  Mon = 'mon',
  Tue = 'tue',
  Wed = 'wed',
  Thu = 'thu',
  Fri = 'fri',
  Sat = 'sat',
}

const DayOfWeekTranslations: { [key in DayOfWeek]: string } = {
  [DayOfWeek.Sun]: 'Domingo',
  [DayOfWeek.Mon]: 'Segunda',
  [DayOfWeek.Tue]: 'Terça',
  [DayOfWeek.Wed]: 'Quarta',
  [DayOfWeek.Thu]: 'Quinta',
  [DayOfWeek.Fri]: 'Sexta',
  [DayOfWeek.Sat]: 'Sábado',
}

type DoseRaw = {
  [key in DayOfWeek]: Dosage<string>[] | null
}

type Dose = {
  [key in DayOfWeek]: Dosage<number>[] | null
}

type Dosage<T> = {
  time: T
  amount: T
}

type MedicationReminder = {
  id: string
  name: string
  dosage_unit: string
  dosage_pronunciation: string
  comments?: string
  dose: DoseRaw
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

type DeleteMedicationReminderParams = {
  userId: string
  id: string
}

interface IMedicationReminderService {
  create(data: CreateMedicationReminderParams): Promise<MedicationReminder>
  get(data: GetMedicationReminderParams): Promise<MedicationReminder[] | null>
  update(data: UpdateMedicationReminderParams): Promise<MedicationReminder>
  delete(data: DeleteMedicationReminderParams): Promise<void>
}

export {
  IMedicationReminderService,
  CreateMedicationReminderParams,
  GetMedicationReminderParams,
  UpdateMedicationReminderParams,
  DeleteMedicationReminderParams,
  MedicationReminder,
  DayOfWeek,
  DayOfWeekTranslations,
  Dose,
  DoseRaw,
  Dosage,
}
