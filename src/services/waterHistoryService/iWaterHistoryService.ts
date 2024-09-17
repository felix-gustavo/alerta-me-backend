type AddNotificationParams = {
  elderlyId: string
  suggested_amount: number
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
  elderlyId: string
}

type IWaterHistoryService = {
  addHistory(data: AddNotificationParams): Promise<WaterHistory>
  getHistoryElderly(data: { elderlyId: string }): Promise<WaterHistory | null>
  getRecentHistoryUser(data: { userId: string }): Promise<WaterHistory | null>
  getHistoryUser(data: {
    userId: string
    dateStr: string
  }): Promise<WaterHistory[]>
  getOlderDateHistoryUser(data: { userId: string }): Promise<Date | null>
  setAmountHistory(data: AmountHistoryParams): Promise<void>
}

export {
  IWaterHistoryService,
  AddNotificationParams,
  WaterHistory,
  AmountHistoryParams,
}
