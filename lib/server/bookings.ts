import "server-only"

import { and, desc, eq, inArray, ne, sql } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { formatINR } from "@/lib/format"
import { getShopsById, listShops, type ShopListing } from "@/lib/server/shops"
import { acceptsCounter, OFFER_WINDOW_MS, quoteFor, simulateShops, timing } from "@/lib/server/simulator"

const { bookings, offers, messages, shops } = schema

export const ACTIVE_STATUSES = ["broadcasting", "accepted", "on_the_way"] as const
/** A request is broadcast to at most this many shops in its category. */
const BROADCAST_SIZE = 4

async function broadcastTargets(booking: schema.Booking) {
  const inCategory = await listShops({ categoryId: booking.categoryId })
  const requested = inCategory.filter((shop) => shop.id === booking.shopId)
  const others = inCategory.filter((shop) => shop.id !== booking.shopId)
  return [...requested, ...others].slice(0, BROADCAST_SIZE)
}

/**
 * Hands the job to a shop. The status guard makes this safe to race: only the
 * first acceptance wins.
 */
export async function acceptBooking(
  booking: Pick<schema.Booking, "id" | "userId">,
  offer: { shopId: string; price: number; etaMinutes: number },
  now = new Date(),
) {
  const won = await db
    .update(bookings)
    .set({
      status: "accepted",
      assignedShopId: offer.shopId,
      price: offer.price,
      etaMinutes: offer.etaMinutes,
      acceptedAt: now,
    })
    .where(and(eq(bookings.id, booking.id), eq(bookings.status, "broadcasting")))
    .returning({ id: bookings.id })
  if (won.length === 0) return false

  await db.batch([
    db
      .update(offers)
      .set({ status: "accepted" })
      .where(and(eq(offers.bookingId, booking.id), eq(offers.shopId, offer.shopId))),
    db
      .update(offers)
      .set({ status: "declined" })
      .where(and(eq(offers.bookingId, booking.id), ne(offers.shopId, offer.shopId))),
    db
      .insert(messages)
      .values({
        id: `accepted:${booking.id}`,
        userId: booking.userId,
        shopId: offer.shopId,
        sender: "shop",
        text: `We've accepted your request at ${formatINR(offer.price)}. Message us here if anything changes.`,
        createdAt: now,
      })
      .onConflictDoNothing(),
  ])
  return true
}

/** Brings a booking up to date: lapses stale broadcasts and applies shop responses. */
async function refreshBooking(booking: schema.Booking) {
  const now = Date.now()

  if (booking.status === "broadcasting") {
    const age = now - booking.createdAt.getTime()

    if (simulateShops) {
      const targets = await broadcastTargets(booking)
      const quote = (shop: ShopListing) =>
        quoteFor({
          bookingId: booking.id,
          shopId: shop.id,
          visitFee: shop.visitFee,
          distanceKm: shop.distanceKm,
          budget: booking.budget,
        })

      if (!booking.allowNegotiation) {
        const first = targets[0]
        if (first && age >= timing.instantAcceptMs) {
          await acceptBooking(booking, { shopId: first.id, ...quote(first) })
          return
        }
      } else {
        const due = targets
          .map((shop, index) => ({ shop, at: booking.createdAt.getTime() + timing.offerDelayMs(index) }))
          .filter(({ at }) => at <= now)
        if (due.length > 0) {
          await db
            .insert(offers)
            .values(
              due.map(({ shop, at }) => ({
                id: `${booking.id}:${shop.id}`,
                bookingId: booking.id,
                shopId: shop.id,
                ...quote(shop),
                createdAt: new Date(at),
              })),
            )
            .onConflictDoNothing()
        }

        const countered = await db
          .select()
          .from(offers)
          .where(and(eq(offers.bookingId, booking.id), eq(offers.status, "countered")))
        for (const offer of countered) {
          if (!offer.counteredAt || offer.counterPrice == null) continue
          if (now - offer.counteredAt.getTime() < timing.counterReplyMs) continue
          if (acceptsCounter(offer.price, offer.counterPrice)) {
            await acceptBooking(booking, {
              shopId: offer.shopId,
              price: offer.counterPrice,
              etaMinutes: offer.etaMinutes,
            })
            return
          }
          await db
            .update(offers)
            .set({ status: "firm" })
            .where(and(eq(offers.id, offer.id), eq(offers.status, "countered")))
        }
      }
    }

    if (age >= OFFER_WINDOW_MS) {
      await db
        .update(bookings)
        .set({ status: "expired", closedAt: new Date() })
        .where(and(eq(bookings.id, booking.id), eq(bookings.status, "broadcasting")))
    }
    return
  }

  if (!simulateShops) return

  if (booking.status === "accepted" && booking.acceptedAt) {
    const start = Math.max(booking.acceptedAt.getTime(), booking.scheduledAt?.getTime() ?? 0)
    if (now >= start + timing.dispatchMs) {
      await db
        .update(bookings)
        .set({ status: "on_the_way", enRouteAt: new Date(start + timing.dispatchMs) })
        .where(and(eq(bookings.id, booking.id), eq(bookings.status, "accepted")))
    }
    return
  }

  if (booking.status === "on_the_way" && booking.enRouteAt && booking.assignedShopId) {
    const doneAt = booking.enRouteAt.getTime() + timing.jobMs
    if (now < doneAt) return
    const finished = await db
      .update(bookings)
      .set({ status: "completed", completedAt: new Date(doneAt), closedAt: new Date(doneAt) })
      .where(and(eq(bookings.id, booking.id), eq(bookings.status, "on_the_way")))
      .returning({ id: bookings.id })
    if (finished.length === 0) return
    await db.batch([
      db
        .update(shops)
        .set({ jobsCompleted: sql`${shops.jobsCompleted} + 1` })
        .where(eq(shops.id, booking.assignedShopId)),
      db
        .insert(messages)
        .values({
          id: `completed:${booking.id}`,
          userId: booking.userId,
          shopId: booking.assignedShopId,
          sender: "shop",
          text: "Job marked complete. Thank you — a quick rating would mean a lot to us.",
          createdAt: new Date(doneAt),
        })
        .onConflictDoNothing(),
    ])
  }
}

const isActive = (booking: schema.Booking) => (ACTIVE_STATUSES as readonly string[]).includes(booking.status)

async function loadBooking(id: string, userId: string) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
    .limit(1)
  return booking ?? null
}

export type OfferView = schema.Offer & { shop: ShopListing }

export async function getBooking(id: string, userId: string) {
  let booking = await loadBooking(id, userId)
  if (!booking) return null
  if (isActive(booking)) {
    await refreshBooking(booking)
    booking = (await loadBooking(id, userId))!
  }

  const [offerRows, targets, reviewRows] = await Promise.all([
    db.select().from(offers).where(eq(offers.bookingId, id)).orderBy(offers.createdAt),
    broadcastTargets(booking),
    db.select().from(schema.reviews).where(eq(schema.reviews.bookingId, id)).limit(1),
  ])
  const shopMap = await getShopsById([booking.shopId, booking.assignedShopId ?? booking.shopId])
  for (const shop of targets) shopMap.set(shop.id, shop)

  return {
    booking,
    requestedShop: shopMap.get(booking.shopId)!,
    shop: shopMap.get(booking.assignedShopId ?? booking.shopId)!,
    offers: offerRows.flatMap((offer): OfferView[] => {
      const shop = shopMap.get(offer.shopId)
      return shop ? [{ ...offer, shop }] : []
    }),
    broadcastCount: targets.length,
    offersCloseAt: new Date(booking.createdAt.getTime() + OFFER_WINDOW_MS),
    review: reviewRows[0] ?? null,
    /** Server clock at read time, so countdowns render identically on both sides. */
    now: Date.now(),
  }
}

export type BookingDetail = NonNullable<Awaited<ReturnType<typeof getBooking>>>

export async function listBookings(userId: string) {
  let rows = await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt))
  const active = rows.filter(isActive)
  if (active.length > 0) {
    await Promise.all(active.map(refreshBooking))
    rows = await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt))
  }
  const shopMap = await getShopsById(rows.map((row) => row.assignedShopId ?? row.shopId))
  const rated = rows.length
    ? await db
        .select({ bookingId: schema.reviews.bookingId, rating: schema.reviews.rating })
        .from(schema.reviews)
        .where(
          inArray(
            schema.reviews.bookingId,
            rows.map((row) => row.id),
          ),
        )
    : []
  const ratings = new Map(rated.map((row) => [row.bookingId, row.rating]))
  return rows.map((booking) => ({
    booking,
    shop: shopMap.get(booking.assignedShopId ?? booking.shopId)!,
    rating: ratings.get(booking.id) ?? null,
  }))
}

/** The most recent in-progress booking, surfaced on the home screen. */
export async function getActiveBooking(userId: string) {
  const [row] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.userId, userId), inArray(bookings.status, [...ACTIVE_STATUSES])))
    .orderBy(desc(bookings.createdAt))
    .limit(1)
  if (!row) return null
  await refreshBooking(row)
  const booking = await loadBooking(row.id, userId)
  if (!booking || !isActive(booking)) return null
  const shopMap = await getShopsById([booking.assignedShopId ?? booking.shopId])
  return { booking, shop: shopMap.get(booking.assignedShopId ?? booking.shopId)! }
}
