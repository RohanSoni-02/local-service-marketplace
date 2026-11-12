import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { createClient, type Client } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

/**
 * libSQL works against a local SQLite file in development and against a hosted
 * Turso database in production — same driver, same SQL.
 */
export const databaseUrl = process.env.TURSO_DATABASE_URL ?? "file:./data/thikana.db"

// SQLite won't create missing parent folders for a local database file.
if (databaseUrl.startsWith("file:")) mkdirSync(dirname(databaseUrl.slice(5)), { recursive: true })

const globalForDb = globalThis as unknown as { __libsql?: Client }

const client =
  globalForDb.__libsql ??
  createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

// Reuse the connection across hot reloads in development.
if (process.env.NODE_ENV !== "production") globalForDb.__libsql = client

export const db = drizzle(client, { schema })
export { schema }
