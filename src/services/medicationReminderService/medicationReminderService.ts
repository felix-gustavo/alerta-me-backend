import { NotFoundException } from '../../exceptions'
import { IAuthorizationService } from '../authorizationService/iAuthorizationService'
import {
  CreateMedicationReminderParams,
  DayOfWeek,
  DeleteMedicationReminderParams,
  Dose,
  GetMedicationReminderParams,
  IMedicationReminderService,
  MedicationReminder,
  UpdateMedicationReminderParams,
} from './iMedicationReminderService'
import { firestore } from 'firebase-admin'
import { DateFormat } from '../../utils/dateFormat'

class MedicationReminderService implements IMedicationReminderService {
  constructor(private readonly authorizationService: IAuthorizationService) {}

  cleanDose = (dose: Dose): Dose => {
    const cleanedDose = {} as Dose

    for (const dayOfWeek in dose) {
      const key = dayOfWeek as DayOfWeek
      cleanedDose[key] = dose[key]?.length === 0 ? null : dose[key]
    }

    return cleanedDose
  }

  convertDoseToSave = (dataDose: Dose) => {
    const dose: Dose = {} as Dose

    for (const d in dataDose) {
      const dayOfWeek = d as DayOfWeek
      const dosages = dataDose[dayOfWeek]
      dose[dayOfWeek] = !dosages
        ? null
        : dosages.map((dosage) => ({
            time: DateFormat.formatHHMMToNumber(dosage.time.toString()),
            amount: Number(dosage.amount),
          }))
    }
    return dose
  }

  create = async ({
    name,
    dosage_unit,
    dosage_pronunciation,
    comments,
    userId,
    ...data
  }: CreateMedicationReminderParams): Promise<MedicationReminder> => {
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const colRef = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medication_reminder')

    const dataToSave = {
      name,
      dosage_unit,
      dosage_pronunciation,
      comments: comments ?? null,
      dose: this.convertDoseToSave(this.cleanDose(data.dose)),
    }

    const docRef = await colRef.add(dataToSave)

    return {
      ...dataToSave,
      id: docRef.id,
    } as MedicationReminder
  }

  get = async ({
    userId,
  }: GetMedicationReminderParams): Promise<MedicationReminder[] | null> => {
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const colRef = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medication_reminder')
      .orderBy('name', 'desc')

    const querySnapshot = await colRef.get()
    if (querySnapshot.empty) return null

    const response: MedicationReminder[] = querySnapshot.docs.map((docData) => {
      const data = docData.data()

      return {
        id: docData.id,
        name: data['name'],
        dosage_unit: data['dosage_unit'],
        dosage_pronunciation: data['dosage_pronunciation'],
        comments: data['comments'],
        dose: data['dose'],
      }
    })

    return response
  }

  update = async (
    data: UpdateMedicationReminderParams
  ): Promise<MedicationReminder> => {
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: data.userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medication_reminder')
      .doc(data.id)

    const docSnap = await docRefUser.get()
    const docData = docSnap.data()

    if (!docData) throw new NotFoundException('Medicamento não encontrado')

    const dataToUpdate = {
      dosage_pronunciation: data.dosage_pronunciation ?? null,
      dosage_unit: data.dosage_unit ?? null,
      name: data.name ?? null,
      comments: data.comments ?? null,
      dose: data.dose
        ? this.convertDoseToSave(this.cleanDose(data.dose))
        : null,
    }

    for (const key in dataToUpdate) {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === null) {
        delete dataToUpdate[key as keyof typeof dataToUpdate]
      }
    }

    await docSnap.ref.update(dataToUpdate)

    return {
      id: data.id,
      name: dataToUpdate.name ?? docData['name'],
      dosage_unit: dataToUpdate.dosage_unit ?? docData['dosage_unit'],
      dosage_pronunciation:
        dataToUpdate.dosage_pronunciation ?? docData['dosage_pronunciation'],
      comments: dataToUpdate.comments ?? docData['comments'],
      dose: dataToUpdate.dose ?? docData['dose'],
    } as MedicationReminder
  }

  delete = async ({
    id,
    userId,
  }: DeleteMedicationReminderParams): Promise<void> => {
    const authorization = await this.authorizationService.get({
      usersType: 'user',
      usersTypeId: userId,
    })

    if (!authorization)
      throw new NotFoundException('Autorização não encontrada')

    const docRefUser = firestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('medication_reminder')
      .doc(id)

    const docSnap = await docRefUser.get()
    const docData = docSnap.data()

    if (!docData) throw new NotFoundException('Medicamento não encontrado')

    await docSnap.ref.delete()
    return
  }
}

export { MedicationReminderService }
