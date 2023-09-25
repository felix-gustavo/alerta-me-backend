import { FirebaseError } from 'firebase/app'
import { NotFoundException } from '../../exceptions'
import { IAuthorizationService } from '../authorizationService/iAuthorizationService'
import {
  CreateMedicationReminderParams,
  DayOfWeek,
  Dosage,
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
    try {
      const authorization = await this.authorizationService.get({
        usersType: 'user',
        usersTypeId: userId,
      })

      if (!authorization)
        throw new NotFoundException('Autorização não encontrada')

      const colRef = firestore()
        .collection('users')
        .doc(authorization.elderly.id)
        .collection('medication_reminder')

      const dataToSave = {
        name,
        dosage_unit,
        dosage_pronunciation,
        comments: comments ?? null,
        dose: this.convertDoseToSave(this.cleanDose(data.dose)),
      }

      console.log('create: dataToSave medication reminder: ', dataToSave)

      const docRef = await colRef.add(dataToSave)

      return {
        ...dataToSave,
        id: docRef.id,
      } as MedicationReminder
    } catch (error: unknown) {
      console.error('Deu erro create MedicationReminderService', error)
      throw error
    }
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
      .doc(authorization.elderly.id)
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
    try {
      const authorization = await this.authorizationService.get({
        usersType: 'user',
        usersTypeId: data.userId,
      })

      if (!authorization)
        throw new NotFoundException('Autorização não encontrada')

      const docRefUser = firestore()
        .collection('users')
        .doc(authorization.elderly.id)
        .collection('medication_reminder')
        .doc(data.id)

      const docSnap = await docRefUser.get()
      const docData = docSnap.data()

      if (!docData) throw new NotFoundException('Medicamento não encontrado')

      const dataToUpdate: Omit<
        UpdateMedicationReminderParams,
        'userId' | 'id'
      > = {
        dosage_pronunciation: data.dosage_pronunciation,
        dosage_unit: data.dosage_unit,
        name: data.name,
        comments: data.comments,
        dose: data.dose
          ? this.convertDoseToSave(this.cleanDose(data.dose))
          : undefined,
      }

      for (const key in dataToUpdate) {
        if (dataToUpdate[key as keyof typeof dataToUpdate] === null) {
          delete dataToUpdate[key as keyof typeof dataToUpdate]
        }
      }

      await docSnap.ref.update(dataToUpdate)

      return {
        ...dataToUpdate,
        id: data.id,
      } as MedicationReminder
    } catch (error: unknown) {
      if (error instanceof FirebaseError && error.code == 'not-found')
        throw new NotFoundException('Remédio não encontrado')

      console.error('Deu erro update MedicalReminderService', error)
      throw error
    }
  }
}

export { MedicationReminderService }
