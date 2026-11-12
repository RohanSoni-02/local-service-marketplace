import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { getShopsById } from "@/lib/server/shops"

const { rentals, tools } = schema

export async function listRentals(userId: string) {
  const rows = await db
    .select({ rental: rentals, tool: tools })
    .from(rentals)
    .innerJoin(tools, eq(tools.id, rentals.toolId))
    .where(eq(rentals.userId, userId))
    .orderBy(desc(rentals.createdAt))
  const shopMap = await getShopsById(rows.map((row) => row.rental.shopId))
  return rows.map((row) => ({ ...row, shop: shopMap.get(row.rental.shopId)! }))
}

export async function getRental(id: string, userId: string) {
  const [row] = await db
    .select({ rental: rentals, tool: tools })
    .from(rentals)
    .innerJoin(tools, eq(tools.id, rentals.toolId))
    .where(and(eq(rentals.id, id), eq(rentals.userId, userId)))
    .limit(1)
  if (!row) return null
  const shopMap = await getShopsById([row.rental.shopId])
  return { ...row, shop: shopMap.get(row.rental.shopId)! }
}
