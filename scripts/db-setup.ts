/**
 * Applies pending migrations and seeds the launch catalogue into an empty
 * database. Safe to run repeatedly: `pnpm db:setup`.
 */
import { count } from "drizzle-orm"
import { migrate } from "drizzle-orm/libsql/migrator"
import { db, schema } from "@/lib/db"
import { buildNeighbourSeed, buildSeed } from "@/lib/db/seed-data"

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" })

  await seedNeighbours()

  const [{ total }] = await db.select({ total: count() }).from(schema.shops)
  if (total > 0) {
    console.log(`Database ready (${total} shops).`)
    return
  }

  const seed = buildSeed()
  await db.batch([
    db.insert(schema.shops).values(seed.shops),
    db.insert(schema.reviews).values(seed.reviews),
    db.insert(schema.tools).values(seed.tools),
    db.insert(schema.inventory).values(seed.inventory),
    db.insert(schema.societies).values(seed.societies),
    db.insert(schema.groupRequests).values(seed.groupRequests),
    db.insert(schema.groupOffers).values(seed.groupOffers),
  ])
  console.log(`Database migrated and seeded with ${seed.shops.length} shops.`)
}

/** Seeded separately so databases created before neighbour lending existed pick it up. */
async function seedNeighbours() {
  const [{ total }] = await db.select({ total: count() }).from(schema.listings)
  if (total > 0) return
  const seed = buildNeighbourSeed()
  await db.batch([
    db.insert(schema.users).values(seed.users).onConflictDoNothing(),
    db.insert(schema.listings).values(seed.listings).onConflictDoNothing(),
  ])
  console.log(`Seeded ${seed.listings.length} neighbour listings.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
