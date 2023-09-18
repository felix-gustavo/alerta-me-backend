import { DateFormat } from '../../utils/dateFormat'
import {
  CreateWaterReminderParams,
  GetWaterReminderParams,
  IWaterReminderService,
  WaterReminder,
} from './iWaterReminderService'
import { IAuthorizationService } from '../authorizationService/iAuthorizationService'
import { NotFoundException, UnprocessableException } from '../../exceptions'
import { firestore } from 'firebase-admin'

class WaterReminderService implements IWaterReminderService {
  constructor(private readonly authorizationService: IAuthorizationService) {}

  create = async (data: CreateWaterReminderParams): Promise<WaterReminder> => {
    const start = DateFormat.formatHHMMSSToNumber(data.start)
    const end = DateFormat.formatHHMMSSToNumber(data.end)
    const interval = parseInt(data.interval)
    const amount = parseInt(data.amount)
    const id = data.userId

    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: id,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly.id)
      .collection('water_reminder')

    const docSnap = await docRefUser.get()
    if (!docSnap.empty)
      throw new UnprocessableException(
        'Impossível criar outro lembrete de água'
      )

    const dataToSave: WaterReminder = {
      start,
      end,
      interval,
      amount,
    }

    await docRefUser.add(dataToSave)
    return dataToSave
  }

  get = async ({
    userId,
  }: GetWaterReminderParams): Promise<WaterReminder | null> => {
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly.id)
      .collection('water_reminder')

    const docSnap = (await docRefUser.get()).docs[0]
    if (!docSnap?.exists) return null

    return docSnap.data() as WaterReminder
  }

  update = async (
    data: Pick<CreateWaterReminderParams, 'userId'> &
      Partial<Omit<CreateWaterReminderParams, 'userId'>>
  ): Promise<WaterReminder> => {
    const start = data.start
      ? DateFormat.formatHHMMSSToNumber(data.start)
      : null
    const end = data.end ? DateFormat.formatHHMMSSToNumber(data.end) : null
    const interval = data.interval ? parseInt(data.interval) : null
    const amount = data.amount ? parseInt(data.amount) : null

    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: data.userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly.id)
      .collection('water_reminder')

    const docSnap = (await docRefUser.get()).docs[0]
    if (!docSnap.exists) {
      throw new UnprocessableException(
        'Lembrete não existe, portanto, não pode ser alterado'
      )
    }

    const docData = docSnap.data()

    const dataToUpdate = {
      start,
      end,
      interval,
      amount,
    }

    for (const key in dataToUpdate) {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === null) {
        delete dataToUpdate[key as keyof typeof dataToUpdate]
      }
    }

    await docSnap.ref.update(dataToUpdate)

    return {
      start: dataToUpdate.start ?? docData['start'],
      end: dataToUpdate.end ?? docData['end'],
      amount: dataToUpdate.amount ?? docData['amount'],
      interval: dataToUpdate.interval ?? docData['interval'],
    } as WaterReminder
  }
}

export { WaterReminderService }
