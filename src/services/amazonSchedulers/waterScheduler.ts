import { AmazonScheduler } from './scheduler.ts'
import { CreateScheduleCommandInput } from '@aws-sdk/client-scheduler'
import { addDays } from 'date-fns'

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

type Times = {
  timeStart: string
  timeEnd: string
  nextDate: Date
}

class WaterScheduler extends AmazonScheduler<WaterSchedulerInput> {
  protected getInput(data: WaterSchedulerInput): CreateScheduleCommandInput {
    const { timeStart, timeEnd, nextDate } = this._getTimes(data.reminders)

    return {
      Name: this.scheduleName(data.input.elderly.id), // required
      ScheduleExpression: `rate(${data.interval} minute)`, // required
      ScheduleExpressionTimezone: 'America/Fortaleza',
      Target: {
        Arn: process.env.WATER_SCHEDULER_ARN, // required
        RoleArn: process.env.SCHEDULER_ROLE_ARN, // required
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
    }
  }

  // async delete({ elderlyId }: { elderlyId: string }): Promise<void> {
  //   try {
  //     const getScheduleCommand = new GetScheduleCommand({ Name: elderlyId })
  //     const response = await this.client.send(getScheduleCommand)
  //     if (response.Name == null) return

  //     const command = new DeleteScheduleCommand({
  //       Name: elderlyId, // required
  //     })
  //     await this.client.send(command)
  //   } catch (error) {
  //     console.log('delete scheduler error: ', error)
  //   }
  //   return
  // }

  private _getTimes(reminders: string[]): Times {
    const timeStart = reminders[0]
    const timeEnd = reminders[reminders.length - 1]

    let date = new Date()
    const nowInSeconds =
      date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds()

    let later = timeStart

    for (const time of reminders) {
      const [hour, minutes] = time.split(':').map(Number)
      console.log(`time: ${time}`)

      const timeInSeconds = hour * 60 * 60 + minutes * 60

      if (timeInSeconds > nowInSeconds) {
        later = time
        break
      }
    }

    const [hour, minutes] = later.split(':').map(Number)
    const curSeconds = hour * 60 * 60 + minutes * 60

    if (nowInSeconds > curSeconds) date = addDays(date, 1)
    date.setHours(hour)
    date.setMinutes(minutes)
    date.setSeconds(0)

    return {
      timeStart,
      timeEnd,
      nextDate: date,
    }
  }
}

export { WaterSchedulerInput, WaterScheduler }
