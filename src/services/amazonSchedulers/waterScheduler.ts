import { AmazonScheduler } from './scheduler'
import { CreateScheduleCommandInput } from '@aws-sdk/client-scheduler'
import { addDays } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

type WaterSchedulerInput = {
  interval: number
  reminders: string[]
  input: {
    elderly: {
      id: string
      ask_user_id: string
    }
    suggested_amount: number
  }
}

class WaterScheduler extends AmazonScheduler<WaterSchedulerInput> {
  protected getInput(data: WaterSchedulerInput): CreateScheduleCommandInput {
    const timezone = 'America/Fortaleza'
    const startDate = this._getStartDate(data.reminders, timezone)

    return {
      Name: this.scheduleName(data.input.elderly.id), // required
      ScheduleExpression: `rate(${data.interval} minute)`, // required
      ScheduleExpressionTimezone: timezone,
      Target: {
        Arn: process.env.WATER_SCHEDULER_ARN, // required
        RoleArn: process.env.SCHEDULER_ROLE_ARN, // required
        Input: JSON.stringify({
          ...data.input,
          start: data.reminders[0],
          end: data.reminders[data.reminders.length - 1],
        }),
        RetryPolicy: { MaximumRetryAttempts: 2 },
      },
      StartDate: startDate,
      FlexibleTimeWindow: { Mode: 'OFF' },
      ActionAfterCompletion: 'NONE',
    }
  }

  private _getStartDate(reminders: string[], timezone: string): Date {
    let date = toZonedTime(new Date(), timezone)

    const nowInSeconds =
      date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds()

    let reminderTime = reminders[0]

    for (const time of reminders) {
      const [hour, minutes] = time.split(':').map(Number)
      const timeInSeconds = hour * 60 * 60 + minutes * 60

      if (timeInSeconds > nowInSeconds) {
        reminderTime = time
        break
      }
    }

    const [hour, minutes] = reminderTime.split(':').map(Number)
    const reminderTimeInSeconds = hour * 60 * 60 + minutes * 60

    if (nowInSeconds > reminderTimeInSeconds) date = addDays(date, 1)
    date.setHours(hour)
    date.setMinutes(minutes)
    date.setSeconds(0)

    return fromZonedTime(date, timezone)
  }
}

export { WaterScheduler }
export type { WaterSchedulerInput }
