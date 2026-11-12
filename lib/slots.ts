const IST_OFFSET_MS = 5.5 * 60 * 60_000

/** A wall-clock time in India, `dayOffset` days from today, as an absolute Date. */
function istTime(now: number, dayOffset: number, hour: number, minute: number) {
  const ist = new Date(now + IST_OFFSET_MS)
  return new Date(
    Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + dayOffset, hour, minute) - IST_OFFSET_MS,
  )
}

const slotTimes: [number, number][] = [
  [10, 0],
  [14, 0],
  [16, 0],
  [18, 30],
]

/** The next few visit slots, starting at least an hour from now. */
export function upcomingSlots(now = Date.now(), limit = 6) {
  const slots: Date[] = []
  for (let day = 0; slots.length < limit && day < 4; day++) {
    for (const [hour, minute] of slotTimes) {
      const slot = istTime(now, day, hour, minute)
      if (slot.getTime() - now >= 60 * 60_000 && slots.length < limit) slots.push(slot)
    }
  }
  return slots
}
