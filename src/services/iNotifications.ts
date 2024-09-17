interface INotifications {
  enableNotifications(elderlyId: string): Promise<void>
  disableNotifications(elderlyId: string): Promise<void>
}

export { INotifications }
