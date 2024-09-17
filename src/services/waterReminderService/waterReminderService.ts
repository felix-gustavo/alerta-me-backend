import {
  CreateWaterReminderStringParams,
  IWaterReminderService,
  UpdateWaterReminderParams,
  WaterReminder,
  WaterReminderParams,
} from './iWaterReminderService.ts'
import {
  NotificationDeniedException,
  UnprocessableException,
} from '../../exceptions/index.ts'
import {
  WaterScheduler,
  WaterSchedulerInput,
} from '../amazonSchedulers/waterScheduler.ts'
import { DateFormat } from '../../utils/dateFormat.ts'
import { IAuthorizationService } from '../authorizationService/iAuthorizationService.ts'
import { IUsersService } from '../usersService/iUsersService.ts'
import { getFirestore } from 'firebase-admin/firestore'

type WaterReminderSchedulerInput = {
  elderly: {
    id: string
    ask_user_id: string
  }
  waterReminder: Omit<WaterReminder, 'id'>
}

class WaterReminderService implements IWaterReminderService {
  constructor(
    private readonly authorizationService: IAuthorizationService,
    private readonly usersService: IUsersService,
    private readonly waterScheduler: WaterScheduler
  ) {}

  create = async ({
    userId,
    ...data
  }: CreateWaterReminderStringParams): Promise<WaterReminder> => {
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId,
    })

    const colRef = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_reminder')

    const [userElderly, querySnapshot] = await Promise.all([
      this.usersService.getElderlyById(authorization.elderly),
      colRef.get(),
    ])

    const dataToSave: WaterReminderParams = {
      start: DateFormat.formatHHMMToNumber(data.start),
      end: DateFormat.formatHHMMToNumber(data.end),
      interval: parseInt(data.interval),
      amount: parseInt(data.amount),
      active: !!data.active,
      reminders: data.reminders,
    }

    if (!querySnapshot.empty || userElderly == null)
      throw new UnprocessableException()

    const { ask_user_id, id: elderlyId } = userElderly

    if (ask_user_id == null && data.active) {
      throw new NotificationDeniedException()
    }

    let schedulerReq: Promise<void> | null = null

    if (ask_user_id && data.active) {
      schedulerReq = this.waterScheduler.runCreate({
        interval: dataToSave.interval,
        reminders: dataToSave.reminders,
        input: {
          elderly: {
            id: elderlyId,
            ask_user_id,
          },
          suggested_amount: Math.trunc(
            dataToSave.amount / dataToSave.reminders.length
          ),
        },
      })
    }

    const [docRef] = await Promise.all([colRef.add(dataToSave), schedulerReq])
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

    const colRef = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_reminder')

    const docSnap = (await colRef.get()).docs[0]
    if (!docSnap?.exists) return null

    return docSnap.data() as WaterReminder
  }

  update = async (data: UpdateWaterReminderParams): Promise<WaterReminder> => {
    const authorization = await this.authorizationService.checkIsAuthorized({
      userId: data.userId,
    })

    const colRef = getFirestore()
      .collection('users')
      .doc(authorization.elderly)
      .collection('water_reminder')

    const [userElderly, querySnapshot] = await Promise.all([
      this.usersService.getElderlyById(authorization.elderly),
      colRef.get(),
    ])

    const docSnap = querySnapshot.docs[0]
    if (!docSnap.exists || userElderly == null) {
      throw new UnprocessableException()
    }

    const docData = docSnap.data() as WaterReminder

    const dataToUpdate: WaterReminderParams = {
      start: data.start
        ? DateFormat.formatHHMMToNumber(data.start)
        : docData.start,
      end: data.end ? DateFormat.formatHHMMToNumber(data.end) : docData.end,
      amount: data.amount ? parseInt(data.amount) : docData.amount,
      interval: data.interval ? parseInt(data.interval) : docData.interval,
      active: data.active != undefined ? !!data.active : docData.active,
      reminders: data.reminders ?? docData.reminders,
    }

    const { ask_user_id, id: elderlyId } = userElderly
    if (ask_user_id == null && data.active) {
      throw new NotificationDeniedException()
    }

    let schedulerReq: Promise<void> | null = null
    if (ask_user_id) {
      schedulerReq = dataToUpdate.active
        ? this.waterScheduler.createOrUpdate({
            scheduleName: elderlyId,
            data: this._waterSchedulerFormatInput({
              elderly: {
                id: elderlyId,
                ask_user_id,
              },
              waterReminder: dataToUpdate,
            }),
          })
        : this.waterScheduler.delete(elderlyId)
    }

    await Promise.all([docSnap.ref.update(dataToUpdate), schedulerReq])
    return { ...dataToUpdate, id: docData.id }
  }

  private _waterSchedulerFormatInput(
    data: WaterReminderSchedulerInput
  ): WaterSchedulerInput {
    return {
      interval: data.waterReminder.interval,
      reminders: data.waterReminder.reminders,
      input: {
        elderly: {
          id: data.elderly.id,
          ask_user_id: data.elderly.ask_user_id,
        },
        suggested_amount: Math.trunc(
          data.waterReminder.amount /
            (data.waterReminder.reminders?.length ?? 1) // POSSIVEL PROBLEMA: NÃO ERA data.waterReminder.reminders, MAS SOMENTE reminders
        ),
      },
    }
  }

  async enableNotifications(elderlyId: string): Promise<void> {
    const waterReminder = await this.get({ userId: elderlyId })

    if (waterReminder) {
      const elderly = await this.usersService.getElderlyById(elderlyId)
      if (elderly == null) throw new UnprocessableException()
      const { ask_user_id } = elderly

      if (ask_user_id) {
        this.waterScheduler.createOrUpdate({
          scheduleName: elderly.id,
          data: this._waterSchedulerFormatInput({
            elderly: {
              id: elderlyId,
              ask_user_id,
            },
            waterReminder: waterReminder,
          }),
        })
      }
    }
  }

  async disableNotifications(elderlyId: string): Promise<void> {
    const querySnapshot = await getFirestore()
      .collection('users')
      .doc(elderlyId)
      .collection('water_reminder')
      .get()

    const docSnap = querySnapshot.docs[0]

    if (docSnap.exists) {
      const waterReminder = docSnap.data() as WaterReminder
      if (waterReminder.active) {
        await Promise.all([
          this.waterScheduler.delete(elderlyId),
          docSnap.ref.update({
            ...waterReminder,
            active: false,
          }),
        ])
      }
    }
  }
}

export { WaterReminderService }
