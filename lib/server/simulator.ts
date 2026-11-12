/**
 * Stand-in for the merchant app.
 *
 * Thikana does not yet have a shop-side client, so nobody would answer a
 * broadcast. Until it exists, this module decides how shops respond: what
 * they quote, whether they take a counter-offer, and how a job progresses.
 * Everything here is pure and deterministic; lib/server/bookings.ts applies the
 * outcomes to the database. Set SIMULATE_SHOPS=false to turn it off once real
 * shops are writing offers and status updates.
 */

export const simulateShops = process.env.SIMULATE_SHOPS !== "false"

/** How long a request stays open for offers before it lapses. */
export const OFFER_WINDOW_MS = 10 * 60_000

export const timing = {
  /** Offers trickle in rather than landing all at once. */
  offerDelayMs: (index: number) => 5_000 + index * 6_000,
  instantAcceptMs: 7_000,
  counterReplyMs: 5_000,
  dispatchMs: 15_000,
  jobMs: 25_000,
  chatReplyMs: 2_500,
  groupOfferMs: 8_000,
}

/** Stable pseudo-random number in [0, 1) derived from a string. */
function unit(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10_000) / 10_000
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step

export function quoteFor(input: {
  bookingId: string
  shopId: string
  visitFee: number
  distanceKm: number
  budget: number | null
}) {
  const seed = `${input.bookingId}:${input.shopId}`
  let price = roundTo(input.visitFee + 80 + unit(seed) * 220, 10)
  // Shops shade their quote toward a stated budget, but never below the visit fee.
  if (input.budget && price > input.budget) {
    price = Math.max(input.visitFee, roundTo((price + input.budget) / 2, 10))
  }
  const etaMinutes = Math.max(10, roundTo(10 + input.distanceKm * 6 + unit(`eta:${seed}`) * 10, 5))
  return { price, etaMinutes }
}

/** Shops take a counter that is within 15% of what they quoted. */
export function acceptsCounter(price: number, counterPrice: number) {
  return counterPrice >= Math.ceil(price * 0.85)
}

const chatReplies = [
  "Sure, let me check and get back to you shortly.",
  "Yes, that works. We'll have someone reach out.",
  "Thanks for the details, noted!",
  "Got it. We'll confirm the timing in a few minutes.",
]

export function chatReplyFor(messageId: string) {
  return chatReplies[Math.floor(unit(messageId) * chatReplies.length)]!
}

const groupProviders: Record<string, [string, string]> = {
  "Pest Control": ["PestFree Solutions", "CleanHome Services"],
  "Water Tank Cleaning": ["WaterCare Services", "AquaPure Tank Cleaners"],
  Gardening: ["GreenThumb Gardens", "Bagh Bahar Nursery"],
  "Deep Cleaning": ["SparkleNest Cleaning", "CleanHome Services"],
}

export function groupOffersFor(requestId: string, category: string) {
  const names = groupProviders[category] ?? ["Society Care Services", "CleanHome Services"]
  return names.map((shopName, i) => ({
    id: `${requestId}:${i}`,
    shopName,
    pricePerFlat: roundTo(140 + unit(`${requestId}:${shopName}`) * 160, 10),
    minFlats: i === 0 ? 5 : 10,
  }))
}
