class DateFormat {
  static formatHHMMToNumber(time: string): number {
    const [hours, minutes] = time.split(':')
    return parseInt(hours) * 100 + parseInt(minutes)
  }

  static formatNumberToHHMM(number: number): string {
    const hours = Math.floor(number / 100)
    const minutes = number % 100
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
    return `${formattedHours}:${formattedMinutes}`
  }
}

export { DateFormat }
