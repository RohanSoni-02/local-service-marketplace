import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { getShopsById } from "@/lib/server/shops"
import { chatReplyFor, simulateShops, timing } from "@/lib/server/simulator"

const { messages } = schema

export async function getThread(userId: string, shopId: string) {
  const load = () =>
    db
      .select()
      .from(messages)
      .where(and(eq(messages.userId, userId), eq(messages.shopId, shopId)))
      .orderBy(messages.createdAt, messages.id)

  let thread = await load()
  const last = thread.at(-1)
  // See lib/server/simulator.ts — there is no merchant app to reply yet.
  if (simulateShops && last?.sender === "user" && Date.now() - last.createdAt.getTime() >= timing.chatReplyMs) {
    await db
      .insert(messages)
      .values({ id: `reply:${last.id}`, userId, shopId, sender: "shop", text: chatReplyFor(last.id) })
      .onConflictDoNothing()
    thread = await load()
  }
  return thread
}

export async function listThreads(userId: string) {
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .orderBy(desc(messages.createdAt), desc(messages.id))
  const latest = new Map<string, schema.Message>()
  for (const row of rows) if (!latest.has(row.shopId)) latest.set(row.shopId, row)
  const shopMap = await getShopsById([...latest.keys()])
  return [...latest.values()].flatMap((last) => {
    const shop = shopMap.get(last.shopId)
    return shop ? [{ shop, last }] : []
  })
}
