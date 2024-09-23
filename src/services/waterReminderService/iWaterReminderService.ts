import { INotifications } from '../iNotifications'

type WaterReminder = {
  id: string
  start: number
  end: number
  interval: number
  amount: number
  active: boolean
  reminders: string[]
}

type WaterReminderParams = Omit<WaterReminder, 'id'>

type CreateWaterReminderStringParams = {
  userId: string
} & { [K in keyof Omit<WaterReminder, 'reminders'>]: string } & Pick<
    WaterReminder,
    'reminders'
  >

type UpdateWaterReminderParams = Partial<
  { [K in keyof Omit<WaterReminder, 'reminders'>]: string } & Pick<
    WaterReminder,
    'reminders'
  >
> & {
  userId: string
}

interface IWaterReminderService extends INotifications {
  create(data: CreateWaterReminderStringParams): Promise<WaterReminder>
  get(data: { userId: string }): Promise<WaterReminder | null>
  update(data: UpdateWaterReminderParams): Promise<WaterReminder>
}

export type {
  IWaterReminderService,
  WaterReminderParams,
  CreateWaterReminderStringParams,
  WaterReminder,
  UpdateWaterReminderParams,
}
