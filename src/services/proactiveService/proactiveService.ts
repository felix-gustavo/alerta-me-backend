import { INotifications } from '../iNotifications.ts'
import { IProactiveService } from './iProactiveService.ts'
import { IUsersService } from '../usersService/iUsersService.ts'

class ProactiveService implements IProactiveService {
  constructor(
    private readonly usersService: IUsersService,
    private readonly reminderServices: INotifications[]
  ) {}

  async proactiveSubAccepted(data: {
    elderlyId: string
    ask_user_id: string
  }): Promise<string> {
    console.log('chamou proactiveSubAccepted')

    await this.usersService.update({
      id: data.elderlyId,
      ask_user_id: data.ask_user_id,
    })

    await Promise.all(
      this.reminderServices.map((e) => e.enableNotifications(data.elderlyId))
    )

    return data.elderlyId
  }

  async proactiveSubDisabled(data: { elderlyId: string }): Promise<string> {
    console.log('chamou proactiveSubDisabled')

    await this.usersService.update({
      id: data.elderlyId,
      ask_user_id: null,
    })

    await Promise.all(
      this.reminderServices.map((e) => e.disableNotifications(data.elderlyId))
    )

    return data.elderlyId
  }
}

export { ProactiveService }
