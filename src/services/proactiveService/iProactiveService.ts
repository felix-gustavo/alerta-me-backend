interface IProactiveService {
  proactiveSubAccepted(data: {
    elderlyId: string
    ask_user_id: string
  }): Promise<string>
  proactiveSubDisabled(data: { elderlyId: string }): Promise<string>
}

export type { IProactiveService }
