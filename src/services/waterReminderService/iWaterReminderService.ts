type CreateWaterReminderParams = {
  userId: string
  start: string
  end: string
  interval: string
  amount: string
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
  suggest_amount: number
  amount: number
}

type UpdateWaterReminderParams = Pick<CreateWaterReminderParams, 'userId'> &
  Partial<Omit<CreateWaterReminderParams, 'userId'> & { active: boolean }>

type IWaterReminderService = {
  create(data: CreateWaterReminderParams): Promise<WaterReminder>
  get(data: { userId: string }): Promise<WaterReminder | null>
  getNotifications(data: { userId: string }): Promise<WaterHistory[]>
  update(data: UpdateWaterReminderParams): Promise<WaterReminder>
}

export {
  IWaterReminderService,
  CreateWaterReminderParams,
  WaterReminder,
  WaterHistory,
  UpdateWaterReminderParams,
}
