"use server"

import { randomInt, randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, eq, gt, sql } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { getUser } from "@/lib/server/auth"
import { HOLD_MS, releaseLapsedHolds } from "@/lib/server/stock"
import type { ActionResult } from "./types"

const { inventory, reservations } = schema

export async function reserveItem(inventoryId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { ok: false, error: "Sign in to continue." }
  await releaseLapsedHolds()

  // Decrement only while stock remains, so the last unit can't be held twice.
  const [item] = await db
    .update(inventory)
    .set({ stock: sql`${inventory.stock} - 1` })
    .where(and(eq(inventory.id, inventoryId), gt(inventory.stock, 0)))
    .returning()
  if (!item) return { ok: false, error: "That just went out of stock." }

  const id = randomUUID()
  await db.insert(reservations).values({
    id,
    userId: user.id,
    inventoryId,
    shopId: item.shopId,
    productName: item.productName,
    price: item.price,
    pickupCode: String(randomInt(1000, 10_000)),
    expiresAt: new Date(Date.now() + HOLD_MS),
  })
  revalidatePath("/search")
  redirect(`/reservation/${id}`)
}

export async function cancelReservation(reservationId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { ok: false, error: "Sign in to continue." }
  const [released] = await db
    .update(reservations)
    .set({ status: "cancelled", stockReleased: true })
    .where(
      and(
        eq(reservations.id, reservationId),
        eq(reservations.userId, user.id),
        eq(reservations.status, "held"),
        eq(reservations.stockReleased, false),
      ),
    )
    .returning({ inventoryId: reservations.inventoryId })
  if (!released) return { ok: false, error: "This hold has already ended." }
  await db
    .update(inventory)
    .set({ stock: sql`${inventory.stock} + 1` })
    .where(eq(inventory.id, released.inventoryId))
  revalidatePath("/", "layout")
  return { ok: true }
}
