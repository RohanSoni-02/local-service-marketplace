"use server"

import { randomInt, randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, eq, inArray, ne } from "drizzle-orm"
import { z } from "zod"
import { listingCategories, listingConditions, serviceArea } from "@/lib/catalog"
import { db, schema } from "@/lib/db"
import { distanceKm } from "@/lib/geo"
import { getUser } from "@/lib/server/auth"
import { BUSY_STATUSES, OPEN_STATUSES } from "@/lib/server/listings"
import { fieldErrors, type ActionResult, type FormState } from "./types"

const { listings, listingPhotos, peerRentals } = schema
const signedOut: ActionResult = { ok: false, error: "Sign in to continue." }

const amount = (label: string, min: number, max: number) =>
  z.coerce
    .number({ error: `Enter ${label}` })
    .int("Enter a whole amount")
    .min(min, min === 0 ? "Can't be negative" : `At least ₹${min}`)
    .max(max, `At most ₹${max.toLocaleString("en-IN")}`)

const listingSchema = z.object({
  title: z.string().trim().min(4, "Give the item a short name").max(70),
  description: z.string().trim().min(15, "Say what's included and anything a borrower should know").max(600),
  category: z.enum(listingCategories.map((category) => category.id) as [string, ...string[]]),
  condition: z.enum(listingConditions),
  dailyPrice: amount("a daily price", 10, 20_000),
  bond: amount("a bond amount", 0, 100_000),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  photo: z
    .string()
    .max(400_000, "That photo is too large")
    .regex(/^(data:image\/(jpeg|webp);base64,[A-Za-z0-9+/=]+)?$/, "That photo couldn't be read")
    .optional(),
})

export async function createListing(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser()
  if (!user) return { error: "Sign in to continue." }
  const parsed = listingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)
  const { photo, latitude, longitude, ...input } = parsed.data

  // Round the pin to ~100 m so a listing shows a neighbourhood, not a front door.
  const point = { latitude: Math.round(latitude * 1000) / 1000, longitude: Math.round(longitude * 1000) / 1000 }
  if (distanceKm(point) > serviceArea.radiusKm * 2) {
    return { fieldErrors: { latitude: `Thikana currently serves ${serviceArea.name} and nearby. Move the pin closer.` } }
  }

  const id = randomUUID()
  const upload = photo ? /^data:(image\/\w+);base64,(.+)$/.exec(photo) : null
  await db.batch([
    db.insert(listings).values({
      id,
      ownerId: user.id,
      ...input,
      ...point,
      area: serviceArea.name,
      photo: upload ? `/listing-photo/${id}` : null,
    }),
    ...(upload ? [db.insert(listingPhotos).values({ listingId: id, mime: upload[1]!, data: upload[2]! })] : []),
  ])
  revalidatePath("/", "layout")
  redirect(`/neighbours/${id}?listed=1`)
}

export async function setListingStatus(listingId: string, status: "active" | "paused" | "removed"): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  if (status === "removed") {
    const [open] = await db
      .select({ id: peerRentals.id })
      .from(peerRentals)
      .where(and(eq(peerRentals.listingId, listingId), inArray(peerRentals.status, [...BUSY_STATUSES])))
      .limit(1)
    if (open) return { ok: false, error: "Finish the current loan before removing this listing." }
  }
  const changed = await db
    .update(listings)
    .set({ status })
    .where(and(eq(listings.id, listingId), eq(listings.ownerId, user.id), ne(listings.status, "removed")))
    .returning({ id: listings.id })
  if (changed.length === 0) return { ok: false, error: "That listing no longer exists." }
  if (status !== "active") {
    // Anyone still waiting on an answer is let down gently.
    await db
      .update(peerRentals)
      .set({ status: "declined", closedAt: new Date() })
      .where(and(eq(peerRentals.listingId, listingId), eq(peerRentals.status, "requested")))
  }
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function requestLoan(listingId: string, days: number, note: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  if (!Number.isInteger(days) || days < 1 || days > 14) return { ok: false, error: "Pick between 1 and 14 days." }

  const [listing] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.id, listingId), eq(listings.status, "active")))
    .limit(1)
  if (!listing) return { ok: false, error: "This item is no longer listed." }
  if (listing.ownerId === user.id) return { ok: false, error: "This is your own listing." }

  const open = await db
    .select({ status: peerRentals.status, renterId: peerRentals.renterId })
    .from(peerRentals)
    .where(and(eq(peerRentals.listingId, listingId), inArray(peerRentals.status, [...OPEN_STATUSES])))
  if (open.some((row) => row.status !== "requested")) return { ok: false, error: "Someone else has this right now." }
  if (open.some((row) => row.renterId === user.id)) return { ok: false, error: "You've already asked for this." }

  const id = randomUUID()
  await db.insert(peerRentals).values({
    id,
    listingId,
    ownerId: listing.ownerId,
    renterId: user.id,
    days,
    dailyPrice: listing.dailyPrice,
    bond: listing.bond,
    note: note.trim().slice(0, 300),
    handoverCode: String(randomInt(1000, 10_000)),
  })
  revalidatePath("/", "layout")
  redirect(`/loan/${id}`)
}

/** Loads a loan for one side of it, in one of the expected states. */
async function loanFor(loanId: string, userId: string, side: "ownerId" | "renterId", from: schema.PeerRentalStatus[]) {
  const [loan] = await db
    .select()
    .from(peerRentals)
    .where(and(eq(peerRentals.id, loanId), eq(peerRentals[side], userId), inArray(peerRentals.status, from)))
    .limit(1)
  return loan ?? null
}

const stale: ActionResult = { ok: false, error: "This loan has moved on. Refresh to see where it stands." }

export async function respondToLoan(loanId: string, approve: boolean): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  const loan = await loanFor(loanId, user.id, "ownerId", ["requested"])
  if (!loan) return stale

  if (approve) {
    const [busy] = await db
      .select({ id: peerRentals.id })
      .from(peerRentals)
      .where(and(eq(peerRentals.listingId, loan.listingId), inArray(peerRentals.status, [...BUSY_STATUSES])))
      .limit(1)
    if (busy) return { ok: false, error: "This item is already out on another loan." }
  }
  await db
    .update(peerRentals)
    .set(approve ? { status: "approved", approvedAt: new Date() } : { status: "declined", closedAt: new Date() })
    .where(and(eq(peerRentals.id, loanId), eq(peerRentals.status, "requested")))
  if (approve) {
    // One item, one borrower: other pending requests are declined.
    await db
      .update(peerRentals)
      .set({ status: "declined", closedAt: new Date() })
      .where(and(eq(peerRentals.listingId, loan.listingId), eq(peerRentals.status, "requested")))
  }
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function cancelLoan(loanId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  const loan = await loanFor(loanId, user.id, "renterId", ["requested", "approved"])
  if (!loan) return { ok: false, error: "This can no longer be cancelled." }
  await db
    .update(peerRentals)
    .set({ status: "cancelled", closedAt: new Date() })
    .where(and(eq(peerRentals.id, loanId), inArray(peerRentals.status, ["requested", "approved"])))
  revalidatePath("/", "layout")
  return { ok: true }
}

/** The owner types the borrower's code at the door, confirming the item and bond changed hands. */
export async function confirmHandover(loanId: string, code: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  const loan = await loanFor(loanId, user.id, "ownerId", ["approved"])
  if (!loan) return stale
  if (code.trim() !== loan.handoverCode) return { ok: false, error: "That code doesn't match. Ask the borrower to show it again." }

  const now = Date.now()
  await db
    .update(peerRentals)
    .set({
      status: "active",
      bondStatus: loan.bond > 0 ? "held" : "none",
      startedAt: new Date(now),
      dueAt: new Date(now + loan.days * 86_400_000),
    })
    .where(and(eq(peerRentals.id, loanId), eq(peerRentals.status, "approved")))
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function markLoanReturned(loanId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  const loan = await loanFor(loanId, user.id, "renterId", ["active"])
  if (!loan) return stale
  await db
    .update(peerRentals)
    .set({ status: "returned", returnedAt: new Date() })
    .where(and(eq(peerRentals.id, loanId), eq(peerRentals.status, "active")))
  revalidatePath("/", "layout")
  return { ok: true }
}

const settleSchema = z.object({
  loanId: z.string().min(1),
  withheld: z
    .string()
    .trim()
    .transform((value) => (value === "" ? 0 : Number(value)))
    .pipe(z.number().int("Enter a whole amount").min(0)),
  claimNote: z.string().trim().max(400),
})

/** The owner checks the item back in and settles the bond, in full or with a deduction for damage. */
export async function settleLoan(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser()
  if (!user) return { error: "Sign in to continue." }
  const parsed = settleSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)
  const { loanId, withheld, claimNote } = parsed.data

  const loan = await loanFor(loanId, user.id, "ownerId", ["active", "returned"])
  if (!loan) return { error: "This loan has already been settled." }
  if (withheld > loan.bond) return { fieldErrors: { withheld: "You can't keep more than the bond." } }
  if (withheld > 0 && claimNote.length < 10) {
    return { fieldErrors: { claimNote: "Describe the damage so the borrower understands the deduction." } }
  }

  const now = new Date()
  await db
    .update(peerRentals)
    .set({
      status: "closed",
      bondStatus: loan.bond === 0 ? "none" : withheld > 0 ? "claimed" : "refunded",
      bondWithheld: withheld,
      claimNote: withheld > 0 ? claimNote : "",
      returnedAt: loan.returnedAt ?? now,
      closedAt: now,
    })
    .where(and(eq(peerRentals.id, loanId), inArray(peerRentals.status, ["active", "returned"])))
  revalidatePath("/", "layout")
  return { ok: true }
}
