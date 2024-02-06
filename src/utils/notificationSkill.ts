import axios, { AxiosError } from 'axios'
import qs from 'qs'
import { AuthService } from '../services/authService'
import { Users } from '../services/usersService/iUsersService'

type NotificationSkillSendParams = {
  carerName: string
  elderly: Users
}

/**
 * 
POST /v1/proactiveEvents/stages/development
Host: api.amazonalexa.com
Content-Type: application/json
Authorization: Bearer {access token}
 */
class NotificationSkill {
  private retry = true
  constructor(private readonly authService: AuthService) {}

  async send(data: NotificationSkillSendParams) {
    try {
      // const clientId = process.env.CLIENTE_ID
      // const clientSecret = process.env.CLIENTE_SECRET

      // const optionsToken = {
      //   method: 'POST',
      //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
      //   data: qs.stringify({
      //     grant_type: 'client_credentials',
      //     client_id: clientId,
      //     client_secret: clientSecret,
      //     scope: 'alexa::proactive_events',
      //   }),
      //   url: 'https://api.amazon.com/auth/o2/token',
      // }

      // const tokens = await axios(optionsToken)
      // console.log('tokens: ', tokens)

      const timestamp = new Date()
      const response = await axios.post(
        'https://api.amazonalexa.com/v1/proactiveEvents/stages/development',
        {
          timestamp: timestamp.toISOString(),
          referenceId: `${data.elderly.id}${timestamp.getTime()}`,
          expiryTime: timestamp.toISOString(),
          event: {
            name: 'AMAZON.MessageAlert.Activated',
            payload: {
              state: {
                status: 'UNREAD',
              },
              messageGroup: {
                creator: {
                  name: data.carerName,
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
          // relevantAudience: {
          //   type: 'Multicast',
          //   payload: {},
          // },
          relevantAudience: {
            type: 'Unicast',
            payload: { user: data.elderly.id },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${data.elderly.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('response: ', response.data)
    } catch (error) {
      console.log('error: ', error)
      if (
        error instanceof AxiosError &&
        error.response?.status === 403 &&
        this.retry
      ) {
        const newTokens = await this.authService.refreshToken(
          data.elderly.refresh_token ?? ''
        )
        this.retry = false
        await this.send({
          carerName: data.carerName,
          elderly: {
            ...data.elderly,
            access_token: newTokens.access_token,
          },
        })
      }
    }
  }
}

export { NotificationSkill, NotificationSkillSendParams }
