import { AmazonScheduler } from './scheduler'
import { CreateScheduleCommandInput } from '@aws-sdk/client-scheduler'
import { MedicalReminder } from '../medicalReminderService/iMedicalReminderService'
import { format } from 'date-fns'

type MedicalSchedulerInput = {
  ask_user_id: string
  input: MedicalReminder
}

export class MedicalScheduler extends AmazonScheduler<MedicalSchedulerInput> {
  protected getInput(data: MedicalSchedulerInput): CreateScheduleCommandInput {
    return {
      Name: this.scheduleName(data.input.id), // required
      ScheduleExpression: `at(${format(
        data.input.datetime,
        "yyyy-MM-dd'T'HH:mm:ss",
      )})`, // required
      ScheduleExpressionTimezone: 'America/Fortaleza',
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

  // async update(data: MedicalSchedulerInput): Promise<void> {
  //   const command = new UpdateScheduleCommand({
  //     Name: this.scheduleName(data.input.id), // required
  //     ScheduleExpression: `at(${data.input.datetime})`, // required
  //     ScheduleExpressionTimezone: 'America/Fortaleza',
  //     Target: {
  //       Arn: process.env.MEDICAL_SCHEDULER_ARN, // required
  //       RoleArn: process.env.SCHEDULER_ROLE_ARN, // required
  //       Input: JSON.stringify(data.input),
  //       RetryPolicy: { MaximumRetryAttempts: 2 },
  //     },
  //     FlexibleTimeWindow: { Mode: 'OFF' },
  //     ActionAfterCompletion: 'NONE',
  //   })

  //   try {
  //     await this.client.send(command)
  //   } catch (error) {
  //     console.log('update scheduler error: ', error)
  //   }
  //   return
  // }
}
