import {
  SchedulerClient,
  CreateScheduleCommand,
  UpdateScheduleCommand,
  GetScheduleCommand,
  DeleteScheduleCommand,
} from '@aws-sdk/client-scheduler'
import { addDays } from 'date-fns'

type AmazonSchedulerInput = {
  interval: number
  reminders: string[]
  input: {
    elderly: {
      id: string
      ask_user_id: string
    }
    carerName: string
    suggested_amount: number
  }
}

type Times = {
  timeStart: string
  timeEnd: string
  nextDate: Date
}

export class AmazonScheduler {
  private readonly client: SchedulerClient

  constructor() {
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

  async createOrUpdate(data: AmazonSchedulerInput): Promise<void> {
    const isEnable = await this.isEnable({ elderlyId: data.input.elderly.id })
    return isEnable ? this.update(data) : this.create(data)
  }

  async create(data: AmazonSchedulerInput): Promise<void> {
    const { timeStart, timeEnd, nextDate } = this._getTimes(data.reminders)

    const command = new CreateScheduleCommand({
      Name: data.input.elderly.id, // required
      ScheduleExpression: `rate(${data.interval} minute)`, // required
      ScheduleExpressionTimezone: 'America/Fortaleza',
      Target: {
        Arn: process.env.SEND_NOTIFICATION_ARN, // required
        RoleArn: process.env.SEND_NOTIFICATION_ROLE_ARN, // required
        Input: JSON.stringify({
          ...data.input,
          start: timeStart,
          end: timeEnd,
        }),
        RetryPolicy: { MaximumRetryAttempts: 2 },
      },
      StartDate: nextDate,
      FlexibleTimeWindow: { Mode: 'OFF' },
      ActionAfterCompletion: 'NONE',
    })

    try {
      await this.client.send(command)
    } catch (error) {
      console.log('create scheduler error: ', error)
    }
    return
  }

  async isEnable({ elderlyId }: { elderlyId: string }): Promise<boolean> {
    const command = new GetScheduleCommand({
      Name: elderlyId, // required
    })

    try {
      const response = await this.client.send(command)
      return response.State === 'ENABLED'
    } catch (error) {
      console.log('GetScheduleCommand error: ', error)
      return false
    }
  }

  async update(data: AmazonSchedulerInput): Promise<void> {
    const { timeStart, timeEnd, nextDate } = this._getTimes(data.reminders)

    const command = new UpdateScheduleCommand({
      Name: data.input.elderly.id, // required
      ScheduleExpression: `rate(${data.interval} minute)`, // required
      ScheduleExpressionTimezone: 'America/Fortaleza',
      Target: {
        Arn: process.env.SEND_NOTIFICATION_ARN, // required
        RoleArn: process.env.SEND_NOTIFICATION_ROLE_ARN, // required
        Input: JSON.stringify({
          ...data.input,
          start: timeStart,
          end: timeEnd,
        }),
        RetryPolicy: { MaximumRetryAttempts: 2 },
      },
      StartDate: nextDate,
      FlexibleTimeWindow: { Mode: 'OFF' },
      ActionAfterCompletion: 'NONE',
    })

    try {
      await this.client.send(command)
    } catch (error) {
      console.log('update scheduler error: ', error)
    }
    return
  }

  async delete({ elderlyId }: { elderlyId: string }): Promise<void> {
    const command = new DeleteScheduleCommand({
      Name: elderlyId, // required
    })
    try {
      await this.client.send(command)
    } catch (error) {
      console.log('delete scheduler error: ', error)
    }
    return
  }

  private _getTimes(reminders: string[]): Times {
    const timeStart = reminders[0]
    const timeEnd = reminders[reminders.length - 1]

    let date: Date = new Date()
    const curTimeInMinutes = date.getHours() * 60 + date.getMinutes()

    let firstLater = timeStart
    for (const time of reminders) {
      const [hour, minutes] = time.split(':').map(Number)
      const timeInMinutes = hour * 60 + minutes

      if (timeInMinutes > curTimeInMinutes) {
        firstLater = time
        break
      }
    }

    const [hour, minutes] = firstLater.split(':').map(Number)
    date.setHours(hour)
    date.setMinutes(minutes)

    const timeInMinutes = hour * 60 + minutes
    if (curTimeInMinutes > timeInMinutes) date = addDays(date, 1)

    return {
      timeStart,
      timeEnd,
      nextDate: date,
    }
  }
}
