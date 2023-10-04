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

type GetWaterReminderParams = {
  userId: string
}

type UpdateWaterReminderParams = Pick<CreateWaterReminderParams, 'userId'> &
  Partial<Omit<CreateWaterReminderParams, 'userId'> & { active: boolean }>

type IWaterReminderService = {
  create(data: CreateWaterReminderParams): Promise<WaterReminder>
  get(data: GetWaterReminderParams): Promise<WaterReminder | null>
  update(data: UpdateWaterReminderParams): Promise<WaterReminder>
}

export {
  IWaterReminderService,
  CreateWaterReminderParams,
  WaterReminder,
  GetWaterReminderParams,
  UpdateWaterReminderParams,
}
