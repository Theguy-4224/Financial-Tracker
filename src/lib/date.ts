export function todayInputValue() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function formatDateHeading(value: string) {
  const today = todayInputValue()
  const yesterdayDate = new Date(`${today}T00:00:00`)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().slice(0, 10)

  if (value === today) return 'Today'
  if (value === yesterday) return 'Yesterday'

  return new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export function currentMonthKey() {
  return todayInputValue().slice(0, 7)
}

export function shiftMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(month: string) {
  return new Intl.DateTimeFormat('en-MY', { month: 'long', year: 'numeric' }).format(
    new Date(`${month}-01T00:00:00`),
  )
}

export function isInMonth(date: string, month: string) {
  return date.startsWith(month)
}
