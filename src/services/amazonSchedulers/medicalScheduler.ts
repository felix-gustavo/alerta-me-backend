import { AmazonScheduler } from './scheduler'
import { CreateScheduleCommandInput } from '@aws-sdk/client-scheduler'
import { MedicalReminder } from '../medicalReminderService/iMedicalReminderService'
import { format } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'

type MedicalSchedulerInput = {
  ask_user_id: string
  input: MedicalReminder
}

export class MedicalScheduler extends AmazonScheduler<MedicalSchedulerInput> {
  protected getInput(data: MedicalSchedulerInput): CreateScheduleCommandInput {
    const timezone = 'America/Fortaleza'

    console.log('data.input.datetime: ', data.input.datetime)

    return {
      Name: this.scheduleName(data.input.id), // required
      ScheduleExpression: `at(${format(
        data.input.datetime,
        "yyyy-MM-dd'T'HH:mm:ss",
      )})`, // required
      ScheduleExpressionTimezone: timezone,
      Target: {
        Arn: process.env.MEDICAL_SCHEDULER_ARN, // required
        RoleArn: process.env.SCHEDULER_ROLE_ARN, // required
        Input: JSON.stringify(data),
        RetryPolicy: { MaximumRetryAttempts: 2 },
      },
      FlexibleTimeWindow: { Mode: 'OFF' },
      ActionAfterCompletion: 'DELETE',
    }
  }
}
