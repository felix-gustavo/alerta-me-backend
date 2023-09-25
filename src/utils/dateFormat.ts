class DateFormat {
  static formatHHMMSSToNumber(time: string): number {
    const [hours, minutes, seconds] = time.split(':')
    return parseInt(hours) * 10000 + parseInt(minutes) * 100 + parseInt(seconds)
  }
  static formatHHMMToNumber(time: string): number {
    const [hours, minutes] = time.split(':')
    return parseInt(hours) * 100 + parseInt(minutes)
  }
}

export { DateFormat }
