import "server-only"

import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { and, eq, gt, lt } from "drizzle-orm"
import { db, schema } from "@/lib/db"

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>

const SESSION_COOKIE = "thikana_session"
const SESSION_DAYS = 30
const KEY_LENGTH = 64

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, keyHex] = stored.split("$")
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false
  const expected = Buffer.from(keyHex, "hex")
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length)
  return timingSafeEqual(actual, expected)
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000)
  await db.insert(schema.sessions).values({ id: hashToken(token), userId, expiresAt })
  // Opportunistically clear out this user's lapsed sessions.
  await db
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), lt(schema.sessions.expiresAt, new Date())))

  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}

export async function destroySession() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)))
  jar.delete(SESSION_COOKIE)
}

export type SessionUser = Omit<schema.User, "passwordHash">

/** The signed-in user for this request, or null. Deduplicated per render. */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null

  const [row] = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      phone: schema.users.phone,
      address: schema.users.address,
      pincode: schema.users.pincode,
      createdAt: schema.users.createdAt,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, hashToken(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1)

  return row ?? null
})

/** For pages: sends signed-out visitors to sign in, then back to `returnTo`. */
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`)
  return user
}

/** Only allow same-site relative redirects after sign-in. */
export function safeNextPath(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/"
}
