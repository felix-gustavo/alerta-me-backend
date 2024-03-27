type CreateWaterReminderParams = {
  userId: string
  start: string
  end: string
  interval: string
  amount: string
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
}

type WaterHistory = {
  id: string
  datetime: Date
  request: boolean
  suggested_amount: number
  amount: number | null
}

type UpdateWaterReminderParams = Pick<CreateWaterReminderParams, 'userId'> &
  Partial<Omit<CreateWaterReminderParams, 'userId'> & { active: boolean }>

type IWaterReminderService = {
  create(data: CreateWaterReminderParams): Promise<WaterReminder>
  addNotifications(data: AddNotificationParams): Promise<WaterHistory>
  get(data: { userId: string }): Promise<WaterReminder | null>
  getNotifications(data: { userId: string }): Promise<WaterHistory[]>
  update(data: UpdateWaterReminderParams): Promise<WaterReminder>
}

export {
  IWaterReminderService,
  CreateWaterReminderParams,
  WaterReminder,
  AddNotificationParams,
  WaterHistory,
  UpdateWaterReminderParams,
}
