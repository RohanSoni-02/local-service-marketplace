"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { and, count, eq } from "drizzle-orm"
import { z } from "zod"
import { societyServiceCategories } from "@/lib/catalog"
import { db, schema } from "@/lib/db"
import { getUser } from "@/lib/server/auth"
import { getMembership } from "@/lib/server/society"
import { fieldErrors, type ActionResult, type FormState } from "./types"

const { societies, societyMembers, groupRequests, groupParticipants, groupOffers } = schema

const flat = z.string().trim().min(1, "Enter your flat number").max(20)

const joinSchema = z.object({ societyId: z.string().min(1, "Pick a society"), flat })

export async function joinSociety(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser()
  if (!user) return { error: "Sign in to continue." }
  const parsed = joinSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)

  const [society] = await db.select().from(societies).where(eq(societies.id, parsed.data.societyId)).limit(1)
  if (!society) return { error: "That society no longer exists." }

  const joined = await db
    .insert(societyMembers)
    .values({ userId: user.id, societyId: society.id, flat: parsed.data.flat, role: "resident" })
    .onConflictDoNothing()
    .returning({ userId: societyMembers.userId })
  if (joined.length === 0) return { error: "You're already linked to a society." }
  revalidatePath("/", "layout")
  return { ok: true }
}

const registerSchema = z.object({
  name: z.string().trim().min(3, "Enter the society's name").max(80),
  address: z.string().trim().min(5, "Enter the street address").max(160),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a 6-digit pincode"),
  flat,
})

export async function registerSociety(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser()
  if (!user) return { error: "Sign in to continue." }
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)
  if (await getMembership(user.id)) return { error: "You're already linked to a society." }

  const { flat: flatNumber, ...society } = parsed.data
  const id = randomUUID()
  await db.batch([
    db.insert(societies).values({ id, ...society }),
    // Whoever registers a society becomes its first admin.
    db.insert(societyMembers).values({ userId: user.id, societyId: id, flat: flatNumber, role: "admin" }),
  ])
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function leaveSociety(): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { ok: false, error: "Sign in to continue." }
  await db.delete(societyMembers).where(eq(societyMembers.userId, user.id))
  revalidatePath("/", "layout")
  return { ok: true }
}

const requestSchema = z.object({
  category: z.enum(societyServiceCategories),
  description: z.string().trim().min(10, "Describe what the society needs").max(400),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
    .refine((value) => value >= new Date().toISOString().slice(0, 10), "Pick a date from today onwards"),
})

export async function createGroupRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser()
  if (!user) return { error: "Sign in to continue." }
  const membership = await getMembership(user.id)
  if (membership?.member.role !== "admin") return { error: "Only society admins can post a group request." }
  const parsed = requestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)

  const id = randomUUID()
  await db.batch([
    db.insert(groupRequests).values({ id, societyId: membership.society.id, createdBy: user.id, ...parsed.data }),
    db.insert(groupParticipants).values({ requestId: id, userId: user.id }),
  ])
  revalidatePath("/society")
  return { ok: true }
}

/** Loads a request only if the caller is a member of its society. */
async function memberRequest(requestId: string, userId: string) {
  const membership = await getMembership(userId)
  if (!membership) return null
  const [request] = await db
    .select()
    .from(groupRequests)
    .where(and(eq(groupRequests.id, requestId), eq(groupRequests.societyId, membership.society.id)))
    .limit(1)
  return request ? { request, membership } : null
}

export async function setGroupParticipation(requestId: string, joining: boolean): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { ok: false, error: "Sign in to continue." }
  const found = await memberRequest(requestId, user.id)
  if (!found || found.request.status !== "open") return { ok: false, error: "This request is no longer open." }

  if (joining) {
    await db.insert(groupParticipants).values({ requestId, userId: user.id }).onConflictDoNothing()
  } else {
    await db
      .delete(groupParticipants)
      .where(and(eq(groupParticipants.requestId, requestId), eq(groupParticipants.userId, user.id)))
  }
  revalidatePath("/society")
  return { ok: true }
}

export async function selectGroupOffer(requestId: string, offerId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { ok: false, error: "Sign in to continue." }
  const found = await memberRequest(requestId, user.id)
  if (!found || found.request.status !== "open") return { ok: false, error: "This request is no longer open." }
  if (found.membership.member.role !== "admin") return { ok: false, error: "Only society admins can confirm a provider." }

  const [offer] = await db
    .select()
    .from(groupOffers)
    .where(and(eq(groupOffers.id, offerId), eq(groupOffers.requestId, requestId)))
    .limit(1)
  if (!offer) return { ok: false, error: "That offer is no longer available." }
  const [joined] = await db
    .select({ total: count() })
    .from(groupParticipants)
    .where(eq(groupParticipants.requestId, requestId))
  if ((joined?.total ?? 0) < offer.minFlats) {
    return { ok: false, error: `This quote needs at least ${offer.minFlats} flats.` }
  }

  await db
    .update(groupRequests)
    .set({ status: "closed", selectedOfferId: offerId })
    .where(and(eq(groupRequests.id, requestId), eq(groupRequests.status, "open")))
  revalidatePath("/society")
  return { ok: true }
}
