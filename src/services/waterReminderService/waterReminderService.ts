import { DateFormat } from '../../utils/dateFormat'
import {
  CreateWaterReminderParams,
  IWaterReminderService,
  UpdateWaterReminderParams,
  WaterHistory,
  WaterReminder,
} from './iWaterReminderService'
import { IAuthorizationService } from '../authorizationService/iAuthorizationService'
import { NotFoundException, UnprocessableException } from '../../exceptions'
import { firestore } from 'firebase-admin'

class WaterReminderService implements IWaterReminderService {
  constructor(private readonly authorizationService: IAuthorizationService) {}

  create = async (data: CreateWaterReminderParams): Promise<WaterReminder> => {
    const start = DateFormat.formatHHMMToNumber(data.start)
    const end = DateFormat.formatHHMMToNumber(data.end)
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
      active: true,
    }

    await docRefUser.add(dataToSave)
    return dataToSave
  }

  get = async ({
    userId,
  }: {
    userId: string
  }): Promise<WaterReminder | null> => {
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

  getNotifications = async ({
    userId,
  }: {
    userId: string
  }): Promise<WaterHistory[]> => {
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly.id)
      .collection('water_history')
      .where('request', '==', true)
      .orderBy('datetime', 'desc')

    const querySnapshot = await docRefUser.get()
    const waterHistory = querySnapshot.docs.map((doc) => {
      const data = doc.data() as WaterHistory
      return {
        ...data,
        id: doc.id,
      }
    })

    return waterHistory
  }

  update = async (data: UpdateWaterReminderParams): Promise<WaterReminder> => {
    const start = data.start ? DateFormat.formatHHMMToNumber(data.start) : null
    const end = data.end ? DateFormat.formatHHMMToNumber(data.end) : null
    const interval = data.interval ? parseInt(data.interval) : null
    const amount = data.amount ? parseInt(data.amount) : null
    const active = data.active ?? null

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
      active,
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
      active: dataToUpdate.active ?? docData['active'],
    } as WaterReminder
  }
}

export { WaterReminderService }
