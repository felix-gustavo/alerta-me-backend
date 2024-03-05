import {
  Authorization,
  IAuthorizationService,
} from '../authorizationService/iAuthorizationService'
import {
  CreateMedicalReminderParams,
  DeleteMedicalReminderParams,
  GetMedicalReminderParams,
  IMedicalReminderService,
  MedicalReminder,
  UpdateMedicalReminderParams,
} from './iMedicalReminderService'
import { NotFoundException } from '../../exceptions'
import { firestore } from 'firebase-admin'
import cron from 'node-cron'
import { DateFormat } from '../../utils/dateFormat'
import { NotificationSkill } from '../../utils/notificationSkill'
import { AuthService } from '../authService'
import { NotificationsUser } from '../usersService/iUsersService'

class MedicalReminderService implements IMedicalReminderService {
  constructor(
    private readonly authorizationService: IAuthorizationService,
    private readonly authService: AuthService
  ) {}

  create = async ({
    address,
    medic_name,
    specialty,
    userId,
    ...data
  }: CreateMedicalReminderParams): Promise<MedicalReminder> => {
    const date = new Date(data.date)
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly.id)
      .collection('medical_reminder')

    const dataToSave = {
      address,
      medic_name,
      specialty,
      datetime: date,
    }

    const docRef = await docRefUser.add(dataToSave)
    const { id: medicalReminderId } = docRef

    this.sendNotification({
      authorization: authorization,
      date,
      medicalReminderId,
      medicName: medic_name.split(' ')[0],
      sendDataToFirestore: async (notificationUser: NotificationsUser) => {
        await firestore()
          .collection('users')
          .doc(authorization.elderly.id)
          .update({
            notifications: firestore.FieldValue.arrayUnion(notificationUser),
          })
      },
    })

    return {
      id: medicalReminderId,
      address: dataToSave.address,
      medic_name: dataToSave.medic_name,
      specialty: dataToSave.specialty,
      date: date.toISOString(),
    } as MedicalReminder
  }

  get = async ({
    userId,
    withPast,
  }: GetMedicalReminderParams): Promise<MedicalReminder[] | null> => {
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly.id)
      .collection('medical_reminder')

    const queryRefWithPast = docRefUser.orderBy('datetime', 'desc')
    const queryRef = docRefUser
      .orderBy('datetime', 'desc')
      .where('datetime', '>=', firestore.Timestamp.now())

    const querySnapshot = await (withPast ? queryRefWithPast : queryRef).get()
    if (querySnapshot.empty) return null

    const response: MedicalReminder[] = querySnapshot.docs.map((docData) => {
      const data = docData.data()

      return {
        id: docData.id,
        address: data['address'],
        medic_name: data['medic_name'],
        specialty: data['specialty'],
        date: (data['datetime'] as firestore.Timestamp).toDate().toISOString(),
      } as MedicalReminder
    })

    return response
  }

  update = async (
    data: UpdateMedicalReminderParams
  ): Promise<MedicalReminder> => {
    const datetime = data.date ? new Date(data.date) : null
    const medic_name = data.medic_name ?? null
    const specialty = data.specialty ?? null
    const address = data.address ?? null
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: data.userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly.id)
      .collection('medical_reminder')

    const docSnap = await docRefUser.doc(data.id).get()
    const docData = docSnap.data()

    if (!docData) throw new NotFoundException('Consulta não encontrada')

    const dataToUpdate = {
      medic_name,
      specialty,
      datetime,
      address,
    }

    for (const key in dataToUpdate) {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === null) {
        delete dataToUpdate[key as keyof typeof dataToUpdate]
      }
    }

    await docSnap.ref.update(dataToUpdate)

    const date = dataToUpdate.datetime

    if (date != null) {
      cron.getTasks().get(data.id)?.stop()

      const fullMedicName = dataToUpdate.medic_name ?? docData['medic_name']
      this.sendNotification({
        authorization,
        date,
        medicalReminderId: data.id,
        medicName: fullMedicName.split(' ')[0],
        sendDataToFirestore: async (notificationUser: NotificationsUser) => {
          const userRef = firestore()
            .collection('users')
            .doc(authorization.elderly.id)

          await firestore().runTransaction(
            async (transaction: firestore.Transaction) => {
              const doc = await transaction.get(userRef)
              const notifications: NotificationsUser[] =
                doc.data()?.notifications ?? []

              console.log('notifications: ', JSON.stringify(notifications))

              const index = notifications.findIndex((e) => e.id === data.id)
              if (index != -1) {
                delete notifications[index]
                notifications.splice(index, 0, notificationUser)
              } else notifications.push(notificationUser)

              return transaction.update(userRef, { notifications })
            }
          )
        },
      })
    }

    return {
      id: data.id,
      medic_name: dataToUpdate.medic_name ?? docData['medic_name'],
      specialty: dataToUpdate.specialty ?? docData['specialty'],
      address: dataToUpdate.address ?? docData['address'],
      date:
        dataToUpdate.datetime ??
        (docData?.['datetime'] as firestore.Timestamp).toDate().toISOString(),
    } as MedicalReminder
  }

  delete = async ({
    id,
    userId,
  }: DeleteMedicalReminderParams): Promise<void> => {
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly.id)
      .collection('medical_reminder')
      .doc(id)

    const docSnap = await docRefUser.get()
    const docData = docSnap.data()

    if (!docData) throw new NotFoundException('Consulta não encontrada')

    cron.getTasks().get(id)?.stop()

    await docSnap.ref.delete()
    return
  }

  private sendNotification({
    date,
    authorization,
    medicalReminderId,
    medicName,
    sendDataToFirestore,
  }: {
    date: Date
    authorization: Authorization
    medicName: string
    medicalReminderId: string
    sendDataToFirestore: (notificationUser: NotificationsUser) => Promise<void>
  }) {
    if (Date.now() >= date.getTime()) return
    const dateCron = DateFormat.dateToCron(date)
    console.log('dateCron create: ', dateCron)

    const task = cron.schedule(
      dateCron,
      async () => {
        const notificationSkill = new NotificationSkill()
        await notificationSkill.send({
          carerName: authorization.user.name,
          elderly: authorization.elderly,
        })

        const notificationUser: NotificationsUser = {
          id: medicalReminderId,
          type: 'medical_reminder',
          message: `Você tem uma consulta agendada com ${medicName} as ${date.getHours()}:${date.getMinutes()}`,
        }

        await sendDataToFirestore(notificationUser)

        task.stop()
      },
      { name: medicalReminderId }
    )
  }
}

export { MedicalReminderService }
