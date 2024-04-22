import {
  SchedulerClient,
  CreateScheduleCommand,
  UpdateScheduleCommand,
} from '@aws-sdk/client-scheduler'

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
  nextTime: string
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

  async create(data: AmazonSchedulerInput): Promise<void> {
    const { timeStart, timeEnd, nextTime } = this._getTimes(data.reminders)
    const [hours, minutes] = nextTime.split(':').map(Number)

    const nextDate = new Date()
    nextDate.setHours(hours)
    nextDate.setMinutes(minutes)

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

  async update(data: AmazonSchedulerInput): Promise<void> {
    const { timeStart, timeEnd, nextTime } = this._getTimes(data.reminders)
    const [hours, minutes] = nextTime.split(':').map(Number)

    const nextDate = new Date()
    nextDate.setHours(hours)
    nextDate.setMinutes(minutes)

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

  private _getTimes(reminders: string[]): Times {
    const timeStart = reminders[0]
    const timeEnd = reminders[reminders.length - 1]

    const date: Date = new Date()
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

    return {
      timeStart,
      timeEnd,
      nextTime: firstLater,
    }
  }
}
