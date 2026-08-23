const DAY_MS = 24 * 60 * 60 * 1000

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function getLocalDateKey(date: Date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseLocalDateKey(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) {
    return null
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function addLocalDays(dateKey: string, amount: number) {
  const date = parseLocalDateKey(dateKey)
  if (!date) {
    return dateKey
  }
  date.setDate(date.getDate() + amount)
  return getLocalDateKey(date)
}

export function isDateInPreviousWindow(candidateDateKey: string, referenceDateKey: string, days: number = 7) {
  const candidate = parseLocalDateKey(candidateDateKey)
  const reference = parseLocalDateKey(referenceDateKey)
  if (!candidate || !reference || days <= 0) {
    return false
  }

  const candidateUtc = Date.UTC(candidate.getFullYear(), candidate.getMonth(), candidate.getDate())
  const referenceUtc = Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate())
  const difference = Math.round((referenceUtc - candidateUtc) / DAY_MS)
  return difference >= 1 && difference <= days
}

export function isDateInWindowIncludingReference(candidateDateKey: string, referenceDateKey: string, days: number = 7) {
  const candidate = parseLocalDateKey(candidateDateKey)
  const reference = parseLocalDateKey(referenceDateKey)
  if (!candidate || !reference || days <= 0) {
    return false
  }

  const candidateUtc = Date.UTC(candidate.getFullYear(), candidate.getMonth(), candidate.getDate())
  const referenceUtc = Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate())
  const difference = Math.round((referenceUtc - candidateUtc) / DAY_MS)
  return difference >= 0 && difference < days
}

export function formatDateKey(dateKey: string) {
  const date = parseLocalDateKey(dateKey)
  if (!date) {
    return dateKey
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function formatMealTime(createdAt: string) {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ''
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}
