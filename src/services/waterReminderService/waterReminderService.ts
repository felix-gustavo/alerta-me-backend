import { DateFormat } from '../../utils/dateFormat'
import {
  AddNotificationParams,
  AmountHistoryParams,
  CreateWaterReminderParams,
  IWaterReminderService,
  UpdateWaterReminderParams,
  WaterHistory,
  WaterReminder,
} from './iWaterReminderService'
import { IAuthorizationService } from '../authorizationService/iAuthorizationService'
import { NotFoundException, UnprocessableException } from '../../exceptions'
import { firestore } from 'firebase-admin'
import { IUsersService, UserElderly } from '../usersService/iUsersService'
import { AmazonScheduler } from '../amazonScheduler'

class WaterReminderService implements IWaterReminderService {
  constructor(
    private readonly authorizationService: IAuthorizationService,
    private readonly usersService: IUsersService
  ) {}

  create = async (data: CreateWaterReminderParams): Promise<WaterReminder> => {
    const start = DateFormat.formatHHMMToNumber(data.start)
    const end = DateFormat.formatHHMMToNumber(data.end)
    const interval = parseInt(data.interval)
    const amount = parseInt(data.amount)
    const id = data.userId
    const reminders = data.reminders
    const active = data.active

    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: id,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRef = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_reminder')

    const [userElderly, docSnap] = await Promise.all([
      this.usersService.getElderlyById(authorization.elderly),
      docRef.get(),
    ])

    if (!docSnap.empty || userElderly == null)
      throw new UnprocessableException()

    const dataToSave: WaterReminder = {
      start,
      end,
      interval,
      amount,
      active,
      reminders,
    }

    const addReq = docRef.add(dataToSave)

    const { ask_user_id, id: elderlyId } = userElderly

    let amazonReq: Promise<void> | null = null
    if (ask_user_id != null && dataToSave.active) {
      const amazonScheduler = new AmazonScheduler()
      amazonReq = amazonScheduler.create({
        interval,
        reminders,
        input: {
          carerName: data.userName,
          elderly: {
            id: elderlyId,
            ask_user_id,
          },
          suggested_amount: amount / reminders.length,
        },
      })
    }

    await Promise.all([addReq, amazonReq])
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
      .doc(authorization.elderly)
      .collection('water_reminder')

    const docSnap = (await docRefUser.get()).docs[0]
    if (!docSnap?.exists) return null

    return docSnap.data() as WaterReminder
  }

  update = async (data: UpdateWaterReminderParams): Promise<WaterReminder> => {
    const start = data.start ? DateFormat.formatHHMMToNumber(data.start) : null
    const end = data.end ? DateFormat.formatHHMMToNumber(data.end) : null
    const interval = data.interval ? parseInt(data.interval) : null
    const amount = data.amount ? parseInt(data.amount) : null
    const active = data.active ?? null
    const reminders = data.reminders

    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: data.userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRef = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_reminder')

    const [userElderly, querySnapshot] = await Promise.all([
      this.usersService.getElderlyById(authorization.elderly),
      docRef.get(),
    ])

    const docSnap = querySnapshot.docs[0]
    if (!docSnap.exists || userElderly == null)
      throw new UnprocessableException()

    const docData = docSnap.data() as WaterReminder

    const dataToUpdate: WaterReminder = {
      start: start ?? docData.start,
      end: end ?? docData.end,
      amount: amount ?? docData.amount,
      interval: interval ?? docData.interval,
      active: active ?? docData.active,
      reminders: reminders ?? docData.reminders,
    }

    for (const key in dataToUpdate) {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === null) {
        delete dataToUpdate[key as keyof typeof dataToUpdate]
      }
    }

    const updateReq = docSnap.ref.update(dataToUpdate)
    const { ask_user_id, id: elderlyId } = userElderly
    let amazonReq: Promise<void> | null = null

    if (ask_user_id != null) {
      const amazonScheduler = new AmazonScheduler()
      amazonReq = dataToUpdate.active
        ? amazonScheduler.createOrUpdate({
            interval: dataToUpdate.interval,
            reminders: dataToUpdate.reminders,
            input: {
              carerName: data.userName,
              elderly: {
                id: elderlyId,
                ask_user_id,
              },
              suggested_amount: dataToUpdate.amount / (reminders?.length ?? 1),
            },
          })
        : amazonScheduler.delete({ elderlyId })
    }

    await Promise.all([updateReq, amazonReq])
    return dataToUpdate
  }

  addHistory = async ({
    elderlyId,
    suggested_amount,
  }: AddNotificationParams): Promise<WaterHistory> => {
    const authorization = await this.authorizationService.get({
      usersType: 'elderly',
      usersTypeId: elderlyId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_history')

    const dataToSave: Omit<WaterHistory, 'id'> = {
      amount: null,
      request: true,
      suggested_amount,
      datetime: new Date(),
    }

    await docRefUser.add(dataToSave)
    return {
      ...dataToSave,
      id: docRefUser.id,
    }
  }

  getHistory = async ({
    userId,
  }: {
    userId: string
  }): Promise<WaterHistory[]> => {
    const authorization = await this.authorizationService.get({
      usersType: 'elderly',
      usersTypeId: userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
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

  async setAmountHistory(data: AmountHistoryParams): Promise<void> {
    const authorization = await this.authorizationService.get({
      usersType: 'elderly',
      usersTypeId: data.userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    await firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_history')
      .doc(data.id)
      .set({ amount: data.amount })
  }
}

export { WaterReminderService }
