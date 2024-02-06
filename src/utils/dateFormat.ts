class DateFormat {
  static formatHHMMToNumber(time: string): number {
    const [hours, minutes] = time.split(':')
    return parseInt(hours) * 100 + parseInt(minutes)
  }

  static dateToCron(date: Date): string {
    const minutes = date.getMinutes()
    const hours = date.getHours()
    const days = date.getDate()
    const months = date.getMonth() + 1
    const dayOfWeek = date.getDay()

    return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`
  }
}

export { DateFormat }
