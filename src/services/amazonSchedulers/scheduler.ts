import {
  CreateScheduleCommand,
  CreateScheduleCommandInput,
  DeleteScheduleCommand,
  GetScheduleCommand,
  SchedulerClient,
  UpdateScheduleCommand,
} from '@aws-sdk/client-scheduler'

abstract class AmazonScheduler<Input> {
  protected readonly client: SchedulerClient

  constructor(private readonly reminderName: string) {
    const region = process.env.AWS_REGION
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? ''
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? ''

    this.client = new SchedulerClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  protected scheduleName = (name: string) => `${this.reminderName}-${name}`

  protected abstract getInput(data: Input): CreateScheduleCommandInput

  async createOrUpdate({
    data,
    scheduleName,
  }: {
    data: Input
    scheduleName: string
  }): Promise<void> {
    return (await this.isEnable(scheduleName))
      ? this.runUpdate(data)
      : this.runCreate(data)
  }

  async isEnable(name: string): Promise<boolean> {
    try {
      const command = new GetScheduleCommand({ Name: this.scheduleName(name) })
      const response = await this.client.send(command)

      return response.State === 'ENABLED'
    } catch (error) {
      console.log('GetScheduleCommand error: ', error)
      return false
    }
  }

  async runCreate(data: Input): Promise<void> {
    try {
      const command = new CreateScheduleCommand(this.getInput(data))
      await this.client.send(command)
    } catch (error) {
      console.log('create scheduler error: ', error)
    }
    return
  }

  async runUpdate(data: Input): Promise<void> {
    try {
      const command = new UpdateScheduleCommand(this.getInput(data))
      await this.client.send(command)
    } catch (error) {
      console.log('update scheduler error: ', error)
    }
    return
  }

  async delete(name: string): Promise<void> {
    try {
      const command = new DeleteScheduleCommand({
        Name: this.scheduleName(name),
      })
      await this.client.send(command)
    } catch (error) {
      console.log('delete scheduler error: ', error)
    }
    return
  }
}

export { AmazonScheduler }
