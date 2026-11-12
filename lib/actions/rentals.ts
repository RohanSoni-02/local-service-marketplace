"use server"

import { randomInt, randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, eq, inArray, ne } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { getUser } from "@/lib/server/auth"
import type { ActionResult } from "./types"

const { rentals, tools } = schema
const signedOut: ActionResult = { ok: false, error: "Sign in to continue." }

export async function createRental(toolId: string, days: number): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  if (!Number.isInteger(days) || days < 1 || days > 14) return { ok: false, error: "Pick between 1 and 14 days." }

  const [tool] = await db.select().from(tools).where(eq(tools.id, toolId)).limit(1)
  if (!tool) return { ok: false, error: "That tool is no longer listed." }

  const id = randomUUID()
  await db.insert(rentals).values({
    id,
    userId: user.id,
    toolId,
    shopId: tool.shopId,
    days,
    dailyPrice: tool.dailyPrice,
    deposit: tool.deposit,
    pickupCode: String(randomInt(1000, 10_000)),
  })

  // Two people can tap "reserve" at once; the earlier reservation keeps the tool.
  const [earlier] = await db
    .select({ id: rentals.id })
    .from(rentals)
    .where(and(eq(rentals.toolId, toolId), inArray(rentals.status, ["reserved", "active"]), ne(rentals.id, id)))
    .limit(1)
  if (earlier) {
    await db.delete(rentals).where(eq(rentals.id, id))
    return { ok: false, error: "Someone just reserved this tool. Try another one." }
  }

  revalidatePath("/", "layout")
  redirect(`/rental/${id}`)
}

async function transition(
  rentalId: string,
  from: schema.RentalStatus,
  set: (rental: schema.Rental) => Partial<schema.Rental>,
  failure: string,
): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return signedOut
  const [rental] = await db
    .select()
    .from(rentals)
    .where(and(eq(rentals.id, rentalId), eq(rentals.userId, user.id), eq(rentals.status, from)))
    .limit(1)
  if (!rental) return { ok: false, error: failure }
  await db
    .update(rentals)
    .set(set(rental))
    .where(and(eq(rentals.id, rentalId), eq(rentals.status, from)))
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function confirmPickup(rentalId: string) {
  return transition(
    rentalId,
    "reserved",
    (rental) => {
      const now = Date.now()
      return { status: "active", pickedUpAt: new Date(now), dueAt: new Date(now + rental.days * 86_400_000) }
    },
    "This reservation is no longer open.",
  )
}

export async function returnRental(rentalId: string) {
  return transition(
    rentalId,
    "active",
    () => ({ status: "returned", returnedAt: new Date() }),
    "This rental isn't active.",
  )
}

export async function cancelRental(rentalId: string) {
  return transition(
    rentalId,
    "reserved",
    () => ({ status: "cancelled" }),
    "Only a reservation that hasn't been picked up can be cancelled.",
  )
}
