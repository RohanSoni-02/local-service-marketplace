"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, eq, inArray, sql } from "drizzle-orm"
import { z } from "zod"
import { getIssueTypes } from "@/lib/catalog"
import { db, schema } from "@/lib/db"
import { getUser } from "@/lib/server/auth"
import { acceptBooking } from "@/lib/server/bookings"
import { getShop } from "@/lib/server/shops"
import { fieldErrors, type ActionResult, type FormState } from "./types"

const { bookings, offers, reviews, shops } = schema

const signedOut: ActionResult = { ok: false, error: "Sign in to continue." }

const optionalAmount = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(z.number().int("Enter a whole amount").min(50, "At least ₹50").max(200_000, "That's too high").nullable())

const bookingSchema = z.object({
  shopId: z.string().min(1),
  issueType: z.string().min(1),
  description: z.string().trim().min(10, "Add a little more detail so shops can quote accurately").max(600),
  address: z.string().trim().min(5, "Enter the address for the visit").max(200),
  when: z.enum(["now", "later"]),
  slot: z.string().optional(),
  budget: optionalAmount,
  allowNegotiation: z.string().optional(),
})

export async function createBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser()
  if (!user) return { error: "Sign in to continue." }
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)
  const input = parsed.data

  const shop = await getShop(input.shopId)
  if (!shop) return { error: "That shop is no longer listed." }
  if (!getIssueTypes(shop.categoryId).includes(input.issueType)) return { error: "Pick an issue type." }

  let scheduledAt: Date | null = null
  if (input.when === "later") {
    scheduledAt = new Date(input.slot ?? "")
    const lead = scheduledAt.getTime() - Date.now()
    if (Number.isNaN(lead) || lead < 30 * 60_000 || lead > 7 * 86_400_000) {
      return { fieldErrors: { slot: "Pick a time slot" } }
    }
  }

  const id = randomUUID()
  await db.insert(bookings).values({
    id,
    userId: user.id,
    shopId: shop.id,
    categoryId: shop.categoryId,
    issueType: input.issueType,
    description: input.description,
    address: input.address,
    scheduledAt,
    budget: input.budget,
    allowNegotiation: input.allowNegotiation === "on",
  })
  revalidatePath("/bookings")
  redirect(`/booking/${id}`)
}

/** Loads an offer only if it belongs to one of the caller's open requests. */
async function openOffer(offerId: string, userId: string) {
  const [row] = await db
    .select({ offer: offers, booking: bookings })
    .from(offers)
    .innerJoin(bookings, eq(bookings.id, offers.bookingId))
    .where(and(eq(offers.id, offerId), eq(bookings.userId, userId), eq(bookings.status, "broadcasting")))
    .limit(1)
  return row ?? null
}

export async function acceptOffer(offerId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  const row = await openOffer(offerId, user.id)
  if (!row || !["pending", "firm"].includes(row.offer.status)) {
    return { ok: false, error: "This offer is no longer available." }
  }
  const accepted = await acceptBooking(row.booking, row.offer)
  if (!accepted) return { ok: false, error: "This request has already been assigned." }
  revalidatePath(`/booking/${row.booking.id}`)
  return { ok: true }
}

export async function declineOffer(offerId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  const row = await openOffer(offerId, user.id)
  if (!row) return { ok: false, error: "This offer is no longer available." }
  await db
    .update(offers)
    .set({ status: "declined" })
    .where(and(eq(offers.id, offerId), inArray(offers.status, ["pending", "firm"])))
  revalidatePath(`/booking/${row.booking.id}`)
  return { ok: true }
}

export async function counterOffer(offerId: string, price: number): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  const row = await openOffer(offerId, user.id)
  if (!row || row.offer.status !== "pending") {
    return { ok: false, error: "You can only counter an offer once." }
  }
  if (!Number.isInteger(price) || price < 50 || price >= row.offer.price) {
    return { ok: false, error: "Enter an amount below the shop's offer." }
  }
  await db
    .update(offers)
    .set({ status: "countered", counterPrice: price, counteredAt: new Date() })
    .where(and(eq(offers.id, offerId), eq(offers.status, "pending")))
  revalidatePath(`/booking/${row.booking.id}`)
  return { ok: true }
}

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  const cancelled = await db
    .update(bookings)
    .set({ status: "cancelled", closedAt: new Date() })
    .where(
      and(
        eq(bookings.id, bookingId),
        eq(bookings.userId, user.id),
        // Once the technician is on the way the visit can't be called off in-app.
        inArray(bookings.status, ["broadcasting", "accepted"]),
      ),
    )
    .returning({ id: bookings.id })
  if (cancelled.length === 0) return { ok: false, error: "This booking can no longer be cancelled." }
  revalidatePath("/", "layout")
  return { ok: true }
}

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Tap a star to rate").max(5),
  text: z.string().trim().max(500),
})

export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser()
  if (!user) return { error: "Sign in to continue." }
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)
  const { bookingId, rating, text } = parsed.data

  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, user.id), eq(bookings.status, "completed")))
    .limit(1)
  if (!booking?.assignedShopId) return { error: "You can rate a job once it's completed." }

  const [first, ...rest] = user.name.split(/\s+/)
  const author = rest.length ? `${first} ${rest.at(-1)![0]}.` : first!

  const inserted = await db
    .insert(reviews)
    .values({ id: randomUUID(), shopId: booking.assignedShopId, bookingId, author, rating, text })
    .onConflictDoNothing({ target: reviews.bookingId })
    .returning({ id: reviews.id })
  if (inserted.length > 0) {
    await db
      .update(shops)
      .set({
        rating: sql`(${shops.rating} * ${shops.ratingCount} + ${rating}) / (${shops.ratingCount} + 1.0)`,
        ratingCount: sql`${shops.ratingCount} + 1`,
      })
      .where(eq(shops.id, booking.assignedShopId))
  }
  revalidatePath("/", "layout")
  return { ok: true }
}
