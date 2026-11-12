const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

export function formatINR(amount: number) {
  return inr.format(amount)
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`
}

export function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 100) * 10} m` : `${km.toFixed(1)} km`
}

// The marketplace operates in India; render every timestamp in IST so server
// and client output always match.
const TZ = "Asia/Kolkata"
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ })
const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: TZ })
const weekdayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: TZ })
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ })

function dayDiff(date: Date, now: Date) {
  const a = Date.parse(dayKeyFmt.format(date))
  const b = Date.parse(dayKeyFmt.format(now))
  return Math.round((a - b) / 86_400_000)
}

export function formatTime(date: Date) {
  return timeFmt.format(date).toUpperCase()
}

/** "Today, 4:00 PM" · "Tomorrow, 10:00 AM" · "12 Aug, 2:00 PM" */
export function formatDateTime(date: Date, now = new Date()) {
  return `${formatDay(date, now)}, ${formatTime(date)}`
}

export function formatDay(date: Date, now = new Date()) {
  const diff = dayDiff(date, now)
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  if (diff === -1) return "Yesterday"
  return dayFmt.format(date)
}

/** Formats an ISO calendar date (YYYY-MM-DD) such as a society's preferred date. */
export function formatISODate(iso: string) {
  const date = new Date(`${iso}T12:00:00+05:30`)
  return Number.isNaN(date.getTime()) ? iso : weekdayFmt.format(date)
}

export function timeAgo(date: Date, now = new Date()) {
  const seconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000))
  if (seconds < 60) return "Just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days < 7) return plural(days, "day") + " ago"
  if (days < 30) return plural(Math.round(days / 7), "week") + " ago"
  return dayFmt.format(date)
}

export function formatPhone(phone: string) {
  return phone.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : phone
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}
