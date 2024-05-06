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
import { IUsersService } from '../usersService/iUsersService'
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
    const userId = data.userId
    const reminders = data.reminders
    const active = data.active

    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    const colRef = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_reminder')

    const [userElderly, docSnap] = await Promise.all([
      this.usersService.getElderlyById(authorization.elderly),
      colRef.get(),
    ])

    if (!docSnap.empty || userElderly == null)
      throw new UnprocessableException()

    const dataToSave: Omit<WaterReminder, 'id'> = {
      start,
      end,
      interval,
      amount,
      active,
      reminders,
    }

    const addReq = colRef.add(dataToSave)

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
          suggested_amount: Math.trunc(amount / reminders.length),
        },
      })
    }

    const [docRef, _] = await Promise.all([addReq, amazonReq])
    return { ...dataToSave, id: docRef.id }
  }

  get = async ({
    userId,
  }: {
    userId: string
  }): Promise<WaterReminder | null> => {
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

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
    const userId = data.userId

    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

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

    const dataToUpdate: Omit<WaterReminder, 'id'> = {
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
              suggested_amount: Math.trunc(
                dataToUpdate.amount / (reminders?.length ?? 1)
              ),
            },
          })
        : amazonScheduler.delete({ elderlyId })
    }

    await Promise.all([updateReq, amazonReq])
    return { ...dataToUpdate, id: docData.id }
  }

  addHistory = async ({
    elderlyId,
    suggested_amount,
  }: AddNotificationParams): Promise<WaterHistory> => {
    const authorization = await this.authorizationService.getByElderly({
      elderlyId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_history')

    const datetime = new Date()
    datetime.setSeconds(0)

    const dataToSave: Omit<WaterHistory, 'id'> = {
      amount: null,
      suggested_amount,
      datetime,
    }

    await docRefUser.add(dataToSave)
    return {
      ...dataToSave,
      id: docRefUser.id,
    }
  }

  getRecentHistory = async ({
    elderlyId,
  }: {
    elderlyId: string
  }): Promise<WaterHistory | null> => {
    const authorization = await this.authorizationService.getByElderly({
      elderlyId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_history')
      .orderBy('datetime', 'desc')
      .limit(1)

    const querySnapshot = await docRefUser.get()
    if (querySnapshot.empty) return null

    const doc = querySnapshot.docs[0]
    const waterHistory = doc.data() as WaterHistory

    return { ...waterHistory, id: doc.id }
  }

  async setAmountHistory({
    id,
    amount,
    elderlyId,
  }: AmountHistoryParams): Promise<void> {
    const authorization = await this.authorizationService.getByElderly({
      elderlyId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    await firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_history')
      .doc(id)
      .update({ amount })
  }
}

export { WaterReminderService }
