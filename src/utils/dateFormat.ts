class DateFormat {
  static formatHHMMToNumber(time: string): number {
    const [hours, minutes] = time.split(':')
    return parseInt(hours) * 100 + parseInt(minutes)
  }
}

export { DateFormat }
