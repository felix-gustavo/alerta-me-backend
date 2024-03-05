import axios, { AxiosError } from 'axios'
import { Users } from '../services/usersService/iUsersService'
import { addMinutes } from 'date-fns'

type NotificationSkillSendParams = {
  carerName: string
  elderly: Users
}

type TokenScope = {
  access_token: string
  scope: string
  token_type: string
  expires_in: number
}

class NotificationSkill {
  private retry = true

  async send(data: NotificationSkillSendParams) {
    try {
      const clientId = process.env.ASK_CLIENTE_ID
      const clientSecret = process.env.ASK_CLIENTE_SECRET

      const tokens: TokenScope = (
        await axios.post(
          'https://api.amazon.com/auth/o2/token',
          {
            scope: 'alexa::proactive_events',
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      ).data
      const timestamp = new Date()
      const response = await axios.post(
        'https://api.amazonalexa.com/v1/proactiveEvents/stages/development',
        {
          timestamp: timestamp.toISOString(),
          referenceId: `${data.elderly.id}-${timestamp.getTime()}`,
          expiryTime: addMinutes(timestamp, 15).toISOString(),
          event: {
            name: 'AMAZON.MessageAlert.Activated',
            payload: {
              state: { status: 'UNREAD' },
              messageGroup: {
                creator: {
                  name: `${
                    data.carerName.split(' ')[0]
                  }. Para mais detalhes sobre o lembrete, diga Alexa, abra alerta me`,
                },
                count: 1,
              },
            },
          },
          localizedAttributes: [
            {
              locale: 'pt-BR',
            },
          ],
          relevantAudience: {
            type: 'Unicast',
            payload: { user: data.elderly.ask_user_id },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('response: ', response)
    } catch (error) {
      console.log('error: ', error)
      if (
        error instanceof AxiosError &&
        error.response?.status === 403 &&
        this.retry
      ) {
        this.retry = false
        await this.send({
          carerName: data.carerName,
          elderly: data.elderly,
        })
      }
    }
  }
}

export { NotificationSkill, NotificationSkillSendParams }
