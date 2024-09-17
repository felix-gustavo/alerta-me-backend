import {
  AddNotificationParams,
  AmountHistoryParams,
  IWaterHistoryService,
  WaterHistory,
} from './iWaterHistoryService.ts'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { IAuthorizationService } from '../authorizationService/iAuthorizationService.ts'
import { UnauthorizedException } from '../../exceptions/index.ts'

class WaterHistoryService implements IWaterHistoryService {
  constructor(private readonly authorizationService: IAuthorizationService) {}

  addHistory = async ({
    elderlyId,
    suggested_amount,
  }: AddNotificationParams): Promise<WaterHistory> => {
    const authorization = await this.authorizationService.getByElderly({
      elderlyId,
    })

    if (!authorization || authorization.status != 'aprovado')
      throw new UnauthorizedException()

    const docRefUser = getFirestore()
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

  getHistoryElderly = async ({
    elderlyId,
  }: {
    elderlyId: string
  }): Promise<WaterHistory | null> => {
    const now = new Date()
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    const docRefUser = getFirestore()
      .collection('users')
      .doc(elderlyId)
      .collection('water_history')
      .where('datetime', '>=', Timestamp.fromDate(startOfDay))
      .orderBy('datetime', 'desc')
      .limit(1)

    const querySnapshot = await docRefUser.get()
    if (querySnapshot.empty) return null

    const doc = querySnapshot.docs[0]
    const dataRaw = doc.data()

    const waterHistory: WaterHistory = {
      id: doc.id,
      amount: dataRaw.amount,
      suggested_amount: dataRaw.suggested_amount,
      datetime: (dataRaw.datetime as Timestamp).toDate(),
    }

    return waterHistory
  }

  getRecentHistoryUser = async ({
    userId,
  }: {
    userId: string
  }): Promise<WaterHistory | null> => {
    const authorization = await this.authorizationService.getByUser({
      userId,
    })

    if (!authorization || authorization.status != 'aprovado')
      throw new UnauthorizedException()

    const now = new Date()
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    const docRefUser = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_history')
      .where('datetime', '>=', Timestamp.fromDate(startOfDay))
      .orderBy('datetime', 'desc')
      .limit(1)

    const querySnapshot = await docRefUser.get()
    if (querySnapshot.empty) return null

    const doc = querySnapshot.docs[0]
    const dataRaw = doc.data()

    const waterHistory: WaterHistory = {
      id: doc.id,
      amount: dataRaw.amount,
      suggested_amount: dataRaw.suggested_amount,
      datetime: (dataRaw.datetime as Timestamp).toDate(),
    }

    return waterHistory
  }

  getHistoryUser = async ({
    userId,
    dateStr,
  }: {
    userId: string
    dateStr: string
  }): Promise<WaterHistory[]> => {
    const authorization = await this.authorizationService.getByUser({
      userId,
    })

    if (!authorization || authorization.status != 'aprovado')
      throw new UnauthorizedException()

    // const now = new Date()
    // const startOfDay = new Date(
    //   now.getFullYear(),
    //   now.getMonth(),
    //   now.getDate()
    // )
    const [year, month, day] = dateStr.split('-').map(Number)

    const startOfdate = new Date(year, month - 1, day, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59)

    const docRefUser = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_history')
      .where('datetime', '>=', Timestamp.fromDate(startOfdate))
      .where('datetime', '<=', Timestamp.fromDate(endOfDay))
      .orderBy('datetime', 'asc')

    const querySnapshot = await docRefUser.get()
    if (querySnapshot.empty) return []

    const waterHistory = querySnapshot.docs.map((doc) => {
      const dataRaw = doc.data()

      return {
        id: doc.id,
        amount: dataRaw.amount,
        suggested_amount: dataRaw.suggested_amount,
        datetime: (dataRaw.datetime as Timestamp).toDate(),
      }
    })

    return waterHistory
  }

  async getOlderDateHistoryUser({
    userId,
  }: {
    userId: string
  }): Promise<Date | null> {
    const authorization = await this.authorizationService.getByUser({
      userId,
    })

    if (!authorization || authorization.status != 'aprovado')
      throw new UnauthorizedException()

    const docRefUser = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_history')
      .orderBy('datetime', 'asc')
      .limit(1)

    const querySnapshot = await docRefUser.get()
    if (querySnapshot.empty) return null

    return (querySnapshot.docs[0].data().datetime as Timestamp).toDate()
  }

  async setAmountHistory({
    id,
    amount,
    elderlyId,
  }: AmountHistoryParams): Promise<void> {
    const authorization = await this.authorizationService.getByElderly({
      elderlyId,
    })

    if (!authorization || authorization.status != 'aprovado')
      throw new UnauthorizedException()

    await getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_history')
      .doc(id)
      .update({ amount })
  }
}

export { WaterHistoryService }
