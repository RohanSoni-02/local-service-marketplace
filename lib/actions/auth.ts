"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, count, eq, gt, lt } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/lib/db"
import { createSession, destroySession, getUser, hashPassword, safeNextPath, verifyPassword } from "@/lib/server/auth"
import { fieldErrors, type FormState } from "./types"

const phone = z
  .string()
  .transform((value) => value.replace(/[\s-]/g, "").replace(/^(\+91|0)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number"))

const pincode = z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a 6-digit pincode")

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  phone,
  password: z.string().min(8, "Use at least 8 characters").max(128),
  address: z.string().trim().min(5, "Enter your flat and street").max(160),
  pincode,
})

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)
  const { password, ...profile } = parsed.data

  const id = randomUUID()
  const inserted = await db
    .insert(schema.users)
    .values({ id, ...profile, passwordHash: await hashPassword(password) })
    .onConflictDoNothing({ target: schema.users.phone })
    .returning({ id: schema.users.id })
  if (inserted.length === 0) {
    return { fieldErrors: { phone: "This number already has an account. Sign in instead." } }
  }

  await createSession(id)
  redirect(safeNextPath(formData.get("next")))
}

const signInSchema = z.object({ phone, password: z.string().min(1, "Enter your password") })

const ATTEMPT_WINDOW_MS = 15 * 60_000
const MAX_ATTEMPTS = 8

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)
  const { phone: number, password } = parsed.data
  const attempts = schema.loginAttempts

  const since = new Date(Date.now() - ATTEMPT_WINDOW_MS)
  const [recent] = await db
    .select({ total: count() })
    .from(attempts)
    .where(and(eq(attempts.phone, number), gt(attempts.createdAt, since)))
  if ((recent?.total ?? 0) >= MAX_ATTEMPTS) {
    return { error: "Too many attempts. Try again in 15 minutes." }
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.phone, number)).limit(1)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await db.insert(attempts).values({ id: randomUUID(), phone: number })
    await db.delete(attempts).where(lt(attempts.createdAt, since))
    return { error: "That number and password don't match." }
  }

  await db.delete(attempts).where(eq(attempts.phone, number))
  await createSession(user.id)
  redirect(safeNextPath(formData.get("next")))
}

export async function signOut() {
  await destroySession()
  redirect("/")
}

const profileSchema = signUpSchema.pick({ name: true, address: true, pincode: true })

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser()
  if (!user) return { error: "Sign in to continue." }
  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fieldErrors(parsed.error)

  await db.update(schema.users).set(parsed.data).where(eq(schema.users.id, user.id))
  revalidatePath("/", "layout")
  return { ok: true }
}
