import { IAuthorizationService } from '../authorizationService/iAuthorizationService'
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

class MedicalReminderService implements IMedicalReminderService {
  constructor(private readonly authorizationService: IAuthorizationService) {}

  create = async ({
    address,
    medic_name,
    specialty,
    userId,
    ...data
  }: CreateMedicalReminderParams): Promise<MedicalReminder> => {
    const date = new Date(data.date)
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medical_reminder')

    const dataToSave = {
      address,
      medic_name,
      specialty,
      datetime: date,
    }

    const docRef = await docRefUser.add(dataToSave)
    const { id: medicalReminderId } = docRef

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
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
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

  update = async ({
    userId,
    ...data
  }: UpdateMedicalReminderParams): Promise<MedicalReminder> => {
    const datetime = data.date ? new Date(data.date) : null
    const medic_name = data.medic_name ?? null
    const specialty = data.specialty ?? null
    const address = data.address ?? null

    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
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
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medical_reminder')
      .doc(id)

    const docSnap = await docRefUser.get()
    const docData = docSnap.data()

    if (!docData) throw new NotFoundException('Consulta não encontrada')
    await docSnap.ref.delete()
    return
  }
}

export { MedicalReminderService }
