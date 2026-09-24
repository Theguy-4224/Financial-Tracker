import type { Frequency } from '../db/types'

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export function advanceRecurringDate(value: string, frequency: Frequency, anchorDay?: number) {
  const [year, month, day] = value.split('-').map(Number)
  const current = new Date(year, month - 1, day)

  if (frequency === 'weekly') {
    current.setDate(current.getDate() + 7)
  } else if (frequency === 'monthly') {
    const nextMonthIndex = current.getMonth() + 1
    const nextYear = current.getFullYear() + Math.floor(nextMonthIndex / 12)
    const normalizedMonth = ((nextMonthIndex % 12) + 12) % 12
    current.setFullYear(nextYear, normalizedMonth, Math.min(anchorDay ?? day, daysInMonth(nextYear, normalizedMonth)))
  } else {
    const nextYear = current.getFullYear() + 1
    current.setFullYear(nextYear, current.getMonth(), Math.min(anchorDay ?? day, daysInMonth(nextYear, current.getMonth())))
  }

  const local = new Date(current.getTime() - current.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}
