import "server-only"

import { and, desc, eq, like, lt, or, sql } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { getShopsById } from "@/lib/server/shops"

const { inventory, reservations } = schema

export const HOLD_MS = 2 * 60 * 60_000

/** Puts units from lapsed holds back on the shelf. Guarded so each hold is released once. */
export async function releaseLapsedHolds() {
  const lapsed = await db
    .update(reservations)
    .set({ stockReleased: true })
    .where(
      and(
        eq(reservations.status, "held"),
        eq(reservations.stockReleased, false),
        lt(reservations.expiresAt, new Date()),
      ),
    )
    .returning({ inventoryId: reservations.inventoryId })
  for (const { inventoryId } of lapsed) {
    await db
      .update(inventory)
      .set({ stock: sql`${inventory.stock} + 1` })
      .where(eq(inventory.id, inventoryId))
  }
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`)

export async function searchStock(query: string) {
  await releaseLapsedHolds()
  const pattern = `%${escapeLike(query.trim())}%`
  const rows = await db
    .select()
    .from(inventory)
    .where(or(like(inventory.productName, pattern), like(inventory.category, pattern)))
    .limit(50)
  const shopMap = await getShopsById(rows.map((row) => row.shopId))
  return rows
    .flatMap((item) => {
      const shop = shopMap.get(item.shopId)
      return shop ? [{ item, shop }] : []
    })
    .sort((a, b) => Number(b.item.stock > 0) - Number(a.item.stock > 0) || a.shop.distanceKm - b.shop.distanceKm)
}

export async function getReservation(id: string, userId: string) {
  const [reservation] = await db
    .select()
    .from(reservations)
    .where(and(eq(reservations.id, id), eq(reservations.userId, userId)))
    .limit(1)
  if (!reservation) return null
  const shopMap = await getShopsById([reservation.shopId])
  return {
    reservation,
    shop: shopMap.get(reservation.shopId)!,
    remainingMs: reservation.expiresAt.getTime() - Date.now(),
  }
}

export async function listActiveReservations(userId: string) {
  const rows = await db
    .select()
    .from(reservations)
    .where(and(eq(reservations.userId, userId), eq(reservations.status, "held")))
    .orderBy(desc(reservations.createdAt))
  const live = rows.filter((row) => row.expiresAt.getTime() > Date.now())
  const shopMap = await getShopsById(live.map((row) => row.shopId))
  return live.map((reservation) => ({ reservation, shop: shopMap.get(reservation.shopId)! }))
}
