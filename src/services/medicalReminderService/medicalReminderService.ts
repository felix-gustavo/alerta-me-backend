import {
  CreateMedicalReminderStringParams,
  DeleteMedicalReminderParams,
  GetMedicalReminderParams,
  IMedicalReminderService,
  MedicalReminder,
  MedicalReminderParams,
  UpdateMedicalReminderParams,
} from './iMedicalReminderService'
import {
  NotFoundException,
  NotificationDeniedException,
  UnprocessableException,
  ValidationException,
} from '../../exceptions/index'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { IAuthorizationService } from '../authorizationService/iAuthorizationService'
import { IUsersService } from '../usersService/iUsersService'
import { MedicalScheduler } from '../amazonSchedulers/medicalScheduler'
import { addHours, isBefore } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

class MedicalReminderService implements IMedicalReminderService {
  constructor(
    private readonly authorizationService: IAuthorizationService,
    private readonly usersService: IUsersService,
    private readonly medicalScheduler: MedicalScheduler,
  ) {}

  create = async (
    data: CreateMedicalReminderStringParams,
  ): Promise<MedicalReminder> => {
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId: data.userId,
    })

    const datetime = new Date(data.datetime)
    const now = new Date(Date.now())
    const zonedNow = toZonedTime(now, 'America/Fortaleza')

    console.log('datetime: ', datetime)
    console.log('now: ', now)
    console.log('zonedDate: ', zonedNow)

    if (isBefore(datetime, zonedNow)) {
      throw new ValidationException(
        'Campo datetime inválido, insira um horário futuro',
      )
    }

    const colRef = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medical_reminder')

    const dataToSave: MedicalReminderParams = {
      address: data.address,
      medic_name: data.medic_name,
      specialty: data.specialty,
      datetime,
      active: !!data.active,
      attended: null,
    }

    const docRef = await colRef.add(dataToSave)

    const userElderly = await this.usersService.getElderlyById(
      authorization.elderly,
    )
    if (userElderly == null) throw new UnprocessableException()

    const { ask_user_id } = userElderly

    if (ask_user_id == null && data.active) {
      throw new NotificationDeniedException()
    }

    const medicalReminder = { ...dataToSave, id: docRef.id }

    if (ask_user_id && data.active) {
      await this.medicalScheduler.runCreate({
        ask_user_id,
        input: medicalReminder,
      })
    }

    return medicalReminder
  }

  get = async ({
    userId,
    isPast,
  }: GetMedicalReminderParams): Promise<MedicalReminder[]> => {
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    const colRef = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medical_reminder')

    const querySnapshot = await colRef
      .orderBy('datetime', 'desc')
      .where('datetime', isPast ? '<' : '>=', Timestamp.now())
      .get()

    if (querySnapshot.empty) return []

    const response: MedicalReminder[] = querySnapshot.docs.map((docData) => {
      const data = docData.data()

      return {
        ...data,
        id: docData.id,
        datetime: (data.datetime as Timestamp).toDate(),
      } as MedicalReminder
    })

    return response
  }

  getToUpdate = async ({
    userId,
  }: {
    userId: string
  }): Promise<MedicalReminder[]> => {
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    const startTimestamp = Timestamp.fromDate(yesterday)
    const endTimestamp = Timestamp.fromDate(now)

    const colRef = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medical_reminder')

    const querySnapshot = await colRef
      .where('attended', '==', null)
      .where('datetime', '>=', startTimestamp)
      .where('datetime', '<=', endTimestamp)
      .orderBy('datetime', 'desc')
      .get()

    if (querySnapshot.empty) return []

    const response: MedicalReminder[] = querySnapshot.docs.map((docData) => {
      const data = docData.data()

      return {
        ...data,
        id: docData.id,
        datetime: (data.datetime as Timestamp).toDate(),
      } as MedicalReminder
    })

    return response
  }

  // async getAllActives({
  //   userId,
  // }: {
  //   userId: string
  // }): Promise<MedicalReminder[]> {
  //   const authorization = await this.authorizationService.checkIsAuthorized({
  //     userId,
  //   })

  //   const querySnapshot = await getFirestore()
  //     .collection('users')
  //     .doc(authorization.elderly)
  //     .collection('medical_reminder')
  //     .get()

  //   if (querySnapshot.empty) return []

  //   return querySnapshot.docs.map((e) => {
  //     const medicalReminder = e.data() as MedicalReminder
  //     return { ...medicalReminder, id: e.id }
  //   })
  // }

  update = async ({
    userId,
    ...data
  }: UpdateMedicalReminderParams): Promise<MedicalReminder> => {
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    if (data.datetime) {
      const datetime = new Date(data.datetime)
      const now = new Date(Date.now())
      const zonedNow = toZonedTime(now, 'America/Fortaleza')

      console.log('datetime: ', datetime)
      console.log('now: ', now)
      console.log('zonedDate: ', zonedNow)

      if (isBefore(datetime, zonedNow)) {
        throw new ValidationException(
          'Campo datetime inválido, insira um horário futuro',
        )
      }
    }

    const colRef = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medical_reminder')

    const [userElderly, docSnap] = await Promise.all([
      this.usersService.getElderlyById(authorization.elderly),
      colRef.doc(data.id).get(),
    ])
    const docData = docSnap.data() as MedicalReminder

    if (docData == null || userElderly == null)
      throw new UnprocessableException()

    const dataToUpdate: MedicalReminderParams = {
      medic_name: data.medic_name ?? docData.medic_name,
      specialty: data.specialty ?? docData.specialty,
      datetime: data.datetime
        ? toZonedTime(new Date(data.datetime), 'America/Fortaleza')
        : docData.datetime,
      address: data.address ?? docData.address,
      active: data.active != undefined ? !!data.active : docData.active,
      attended: data.attended != undefined ? !!data.attended : docData.attended,
    }

    console.log('dataToUpdate: ', JSON.stringify(dataToUpdate, null, 2))

    const medicalReminder: MedicalReminder = { ...dataToUpdate, id: data.id }

    const { ask_user_id } = userElderly
    if (ask_user_id == null && data.active) {
      throw new NotificationDeniedException()
    }

    let schedulerReq: Promise<void> | null = null
    if (ask_user_id) {
      schedulerReq = dataToUpdate.active
        ? this.medicalScheduler.createOrUpdate({
            scheduleName: data.id,
            data: {
              ask_user_id,
              input: medicalReminder,
            },
          })
        : this.medicalScheduler.delete(data.id)
    }

    await Promise.all([docSnap.ref.update(dataToUpdate), schedulerReq])
    return medicalReminder
  }

  delete = async ({
    id,
    userId,
  }: DeleteMedicalReminderParams): Promise<void> => {
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    const docRefUser = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medical_reminder')
      .doc(id)

    const docSnap = await docRefUser.get()
    const docData = docSnap.data()

    if (!docData) throw new NotFoundException('Consulta não encontrada')

    await Promise.all([
      docSnap.ref.delete(),
      this.medicalScheduler.delete(docSnap.ref.id),
    ])

    return
  }

  async enableNotifications(): Promise<void> {
    return
    // const reminders = await this.getAllActives({ userId: elderlyId })

    // await Promise.all(
    //   reminders.map((e) => {
    //     this.medicalScheduler.createOrUpdate({
    //       scheduleName: e.id,
    //       data: { elderlyId, input: e },
    //     })
    //   })
    // )
  }

  async disableNotifications(elderlyId: string): Promise<void> {
    const querySnapshot = await getFirestore()
      .collection('users')
      .doc(elderlyId)
      .collection('medical_reminder')
      .where('active', '==', true)
      .get()

    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (docData) => {
        await Promise.all([
          this.medicalScheduler.delete(docData.id),
          docData.ref.update({ active: false }),
        ])
      })
    }
  }
}

export { MedicalReminderService }
