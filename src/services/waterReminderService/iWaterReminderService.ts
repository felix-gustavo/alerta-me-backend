interface CreateWaterReminderParams {
  userId: string
  start: string
  end: string
  interval: string
  amount: string
}

interface WaterReminder {
  start: number
  end: number
  interval: number
  amount: number
}

interface GetWaterReminderParams {
  userId: string
}

interface IWaterReminderService {
  create(data: CreateWaterReminderParams): Promise<WaterReminder>
  get(data: GetWaterReminderParams): Promise<WaterReminder | null>
  update(
    data: Pick<CreateWaterReminderParams, 'userId'> &
      Partial<Omit<CreateWaterReminderParams, 'userId'>>
  ): Promise<WaterReminder>
}

export {
  IWaterReminderService,
  CreateWaterReminderParams,
  WaterReminder,
  GetWaterReminderParams,
}
