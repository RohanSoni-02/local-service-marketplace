"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { db, schema } from "@/lib/db"
import { getUser } from "@/lib/server/auth"
import { getShop } from "@/lib/server/shops"
import type { ActionResult } from "./types"

export async function sendMessage(shopId: string, text: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { ok: false, error: "Sign in to continue." }
  const body = text.trim().slice(0, 1000)
  if (!body) return { ok: false, error: "Write a message first." }
  if (!(await getShop(shopId))) return { ok: false, error: "That shop is no longer listed." }

  await db.insert(schema.messages).values({ id: randomUUID(), userId: user.id, shopId, sender: "user", text: body })
  revalidatePath(`/chat/${shopId}`)
  return { ok: true }
}
