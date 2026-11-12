import "server-only"

import { and, desc, eq, inArray, like, ne, or } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { distanceKm } from "@/lib/geo"
import { getShopsById } from "@/lib/server/shops"
import { simulateShops, timing } from "@/lib/server/simulator"

const { listings, peerRentals, users, tools } = schema

/** While a loan is in any of these states the item can't be requested by someone else. */
export const BUSY_STATUSES = ["approved", "active", "returned"] as const
export const OPEN_STATUSES = ["requested", ...BUSY_STATUSES] as const

/** "Aarav M." — neighbours see a first name and initial, never a full name. */
export function publicName(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/)
  return rest.length ? `${first} ${rest.at(-1)![0]}.` : first!
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`)

async function busyListingIds(ids: string[]) {
  if (ids.length === 0) return new Set<string>()
  const rows = await db
    .select({ listingId: peerRentals.listingId })
    .from(peerRentals)
    .where(and(inArray(peerRentals.listingId, ids), inArray(peerRentals.status, [...BUSY_STATUSES])))
  return new Set(rows.map((row) => row.listingId))
}

type Row = { listing: schema.Listing; ownerName: string }

async function toViews(rows: Row[]) {
  const busy = await busyListingIds(rows.map((row) => row.listing.id))
  return rows
    .map(({ listing, ownerName }) => ({
      ...listing,
      ownerName: publicName(ownerName),
      distanceKm: distanceKm(listing),
      available: !busy.has(listing.id),
    }))
    .sort((a, b) => Number(b.available) - Number(a.available) || a.distanceKm - b.distanceKm)
}

export type ListingView = Awaited<ReturnType<typeof toViews>>[number]

export async function searchListings(options: { query?: string; category?: string; limit?: number } = {}) {
  const term = options.query?.trim()
  const pattern = term ? `%${escapeLike(term)}%` : null
  const rows = await db
    .select({ listing: listings, ownerName: users.name })
    .from(listings)
    .innerJoin(users, eq(users.id, listings.ownerId))
    .where(
      and(
        eq(listings.status, "active"),
        options.category ? eq(listings.category, options.category) : undefined,
        pattern ? or(like(listings.title, pattern), like(listings.description, pattern)) : undefined,
      ),
    )
    .orderBy(desc(listings.createdAt))
    .limit(options.limit ?? 60)
  return toViews(rows)
}

/** Shop rental tools matching the same search, so one query covers shops and neighbours. */
export async function searchShopTools(query: string) {
  const term = query.trim()
  if (term.length < 2) return []
  const pattern = `%${escapeLike(term)}%`
  const rows = await db
    .select()
    .from(tools)
    .where(or(like(tools.name, pattern), like(tools.category, pattern)))
    .limit(20)
  const shopMap = await getShopsById(rows.map((row) => row.shopId))
  return rows.flatMap((tool) => {
    const shop = shopMap.get(tool.shopId)
    return shop ? [{ tool, shop }] : []
  })
}

export async function getListing(id: string) {
  const rows = await db
    .select({ listing: listings, ownerName: users.name })
    .from(listings)
    .innerJoin(users, eq(users.id, listings.ownerId))
    .where(and(eq(listings.id, id), ne(listings.status, "removed")))
    .limit(1)
  const [view] = await toViews(rows)
  return view ?? null
}

export async function listOwnListings(ownerId: string) {
  const rows = await db
    .select({ listing: listings, ownerName: users.name })
    .from(listings)
    .innerJoin(users, eq(users.id, listings.ownerId))
    .where(and(eq(listings.ownerId, ownerId), ne(listings.status, "removed")))
    .orderBy(desc(listings.createdAt))
  return toViews(rows)
}

/** Plays a seeded neighbour's side of a loan. See lib/server/simulator.ts. */
async function playSeedOwner(rental: schema.PeerRental) {
  const now = Date.now()
  const guard = (status: schema.PeerRentalStatus) => and(eq(peerRentals.id, rental.id), eq(peerRentals.status, status))

  if (rental.status === "requested" && now - rental.createdAt.getTime() >= timing.peerApproveMs) {
    await db.update(peerRentals).set({ status: "approved", approvedAt: new Date() }).where(guard("requested"))
  } else if (rental.status === "approved" && rental.approvedAt && now - rental.approvedAt.getTime() >= timing.peerHandoverMs) {
    await db
      .update(peerRentals)
      .set({
        status: "active",
        bondStatus: rental.bond > 0 ? "held" : "none",
        startedAt: new Date(now),
        dueAt: new Date(now + rental.days * 86_400_000),
      })
      .where(guard("approved"))
  } else if (rental.status === "returned" && rental.returnedAt && now - rental.returnedAt.getTime() >= timing.peerSettleMs) {
    await db
      .update(peerRentals)
      .set({ status: "closed", bondStatus: rental.bond > 0 ? "refunded" : "none", closedAt: new Date() })
      .where(guard("returned"))
  }
}

const loanSelection = {
  rental: peerRentals,
  listing: listings,
}

async function decorate(rows: { rental: schema.PeerRental; listing: schema.Listing }[], userId: string) {
  const ids = [...new Set(rows.flatMap((row) => [row.rental.ownerId, row.rental.renterId]))]
  const people = ids.length
    ? await db
        .select({ id: users.id, name: users.name, phone: users.phone, isSeed: users.isSeed })
        .from(users)
        .where(inArray(users.id, ids))
    : []
  const byId = new Map(people.map((person) => [person.id, person]))
  return rows.map(({ rental, listing }) => {
    const role = rental.ownerId === userId ? ("owner" as const) : ("renter" as const)
    const other = byId.get(role === "owner" ? rental.renterId : rental.ownerId)!
    // Phone numbers are shared only once both sides have agreed to the loan.
    const agreed = ["approved", "active", "returned"].includes(rental.status)
    return {
      rental,
      listing,
      role,
      ownerIsSeed: byId.get(rental.ownerId)?.isSeed ?? false,
      other: { name: publicName(other.name), phone: agreed && !other.isSeed ? other.phone : null },
    }
  })
}

export async function getLoan(id: string, userId: string) {
  const load = () =>
    db
      .select(loanSelection)
      .from(peerRentals)
      .innerJoin(listings, eq(listings.id, peerRentals.listingId))
      .where(and(eq(peerRentals.id, id), or(eq(peerRentals.ownerId, userId), eq(peerRentals.renterId, userId))))
      .limit(1)

  let [loan] = await decorate(await load(), userId)
  if (!loan) return null
  if (simulateShops && loan.ownerIsSeed && (OPEN_STATUSES as readonly string[]).includes(loan.rental.status)) {
    await playSeedOwner(loan.rental)
    ;[loan] = await decorate(await load(), userId)
  }
  return loan ?? null
}

export type Loan = NonNullable<Awaited<ReturnType<typeof getLoan>>>

export async function listLoans(userId: string) {
  const load = () =>
    db
      .select(loanSelection)
      .from(peerRentals)
      .innerJoin(listings, eq(listings.id, peerRentals.listingId))
      .where(or(eq(peerRentals.ownerId, userId), eq(peerRentals.renterId, userId)))
      .orderBy(desc(peerRentals.createdAt))

  let loans = await decorate(await load(), userId)
  const stale = loans.filter(
    (loan) => simulateShops && loan.ownerIsSeed && (OPEN_STATUSES as readonly string[]).includes(loan.rental.status),
  )
  if (stale.length > 0) {
    await Promise.all(stale.map((loan) => playSeedOwner(loan.rental)))
    loans = await decorate(await load(), userId)
  }
  return loans
}
