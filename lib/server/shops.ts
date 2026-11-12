import "server-only"

import { cache } from "react"
import { and, desc, eq, inArray } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { distanceKm } from "@/lib/geo"

export type ShopListing = schema.Shop & { distanceKm: number }

const withDistance = (shop: schema.Shop): ShopListing => ({ ...shop, distanceKm: distanceKm(shop) })

export async function listShops(options: { categoryId?: string; sort?: "distance" | "rating" } = {}) {
  const rows = await db
    .select()
    .from(schema.shops)
    .where(options.categoryId ? eq(schema.shops.categoryId, options.categoryId) : undefined)
  const shops = rows.map(withDistance)
  return options.sort === "rating"
    ? shops.sort((a, b) => b.rating - a.rating || a.distanceKm - b.distanceKm)
    : shops.sort((a, b) => a.distanceKm - b.distanceKm)
}

export const getShop = cache(async (id: string) => {
  const [shop] = await db.select().from(schema.shops).where(eq(schema.shops.id, id)).limit(1)
  return shop ? withDistance(shop) : null
})

export async function getShopsById(ids: string[]) {
  const unique = [...new Set(ids)]
  if (unique.length === 0) return new Map<string, ShopListing>()
  const rows = await db.select().from(schema.shops).where(inArray(schema.shops.id, unique))
  return new Map(rows.map((shop) => [shop.id, withDistance(shop)]))
}

export function listReviews(shopId: string, limit = 20) {
  return db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.shopId, shopId))
    .orderBy(desc(schema.reviews.createdAt))
    .limit(limit)
}

export type ToolListing = schema.Tool & { available: boolean }

/** A tool is out while someone has it reserved or in hand. */
async function unavailableToolIds(toolIds: string[]) {
  if (toolIds.length === 0) return new Set<string>()
  const rows = await db
    .select({ toolId: schema.rentals.toolId })
    .from(schema.rentals)
    .where(and(inArray(schema.rentals.toolId, toolIds), inArray(schema.rentals.status, ["reserved", "active"])))
  return new Set(rows.map((row) => row.toolId))
}

export async function listTools(shopId: string): Promise<ToolListing[]> {
  const tools = await db.select().from(schema.tools).where(eq(schema.tools.shopId, shopId))
  const out = await unavailableToolIds(tools.map((tool) => tool.id))
  return tools.map((tool) => ({ ...tool, available: !out.has(tool.id) }))
}

export async function getTool(id: string): Promise<ToolListing | null> {
  const [tool] = await db.select().from(schema.tools).where(eq(schema.tools.id, id)).limit(1)
  if (!tool) return null
  const out = await unavailableToolIds([id])
  return { ...tool, available: !out.has(id) }
}
