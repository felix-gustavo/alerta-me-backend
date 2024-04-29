type CreateWaterReminderParams = {
  userName: string
  userId: string
  start: string
  end: string
  interval: string
  amount: string
  active: boolean
  reminders: string[]
}

type AddNotificationParams = {
  elderlyId: string
  suggested_amount: number
}

type WaterReminder = {
  start: number
  end: number
  interval: number
  amount: number
  active: boolean
  reminders: string[]
}

type WaterHistory = {
  id: string
  datetime: Date
  suggested_amount: number
  amount: number | null
}

type AmountHistoryParams = {
  id: string
  amount: number | null
  userId: string
}

type UpdateWaterReminderParams = Pick<
  CreateWaterReminderParams,
  'userId' | 'userName'
> &
  Partial<Omit<CreateWaterReminderParams, 'userId'> & { active: boolean }>

type IWaterReminderService = {
  create(data: CreateWaterReminderParams): Promise<WaterReminder>
  get(data: { userId: string }): Promise<WaterReminder | null>
  update(data: UpdateWaterReminderParams): Promise<WaterReminder>
  addHistory(data: AddNotificationParams): Promise<WaterHistory>
  getRecentHistory(data: { userId: string }): Promise<WaterHistory | null>
  setAmountHistory(data: AmountHistoryParams): Promise<void>
}

export {
  IWaterReminderService,
  CreateWaterReminderParams,
  WaterReminder,
  AddNotificationParams,
  WaterHistory,
  UpdateWaterReminderParams,
  AmountHistoryParams,
}
