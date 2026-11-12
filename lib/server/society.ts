import "server-only"

import { count, desc, eq, inArray, like, or } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { groupOffersFor, simulateShops, timing } from "@/lib/server/simulator"

const { societies, societyMembers, groupRequests, groupParticipants, groupOffers } = schema

export async function getMembership(userId: string) {
  const [row] = await db
    .select({ member: societyMembers, society: societies })
    .from(societyMembers)
    .innerJoin(societies, eq(societies.id, societyMembers.societyId))
    .where(eq(societyMembers.userId, userId))
    .limit(1)
  return row ?? null
}

export async function searchSocieties(query: string) {
  const term = query.trim()
  const pattern = `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
  return db
    .select()
    .from(societies)
    .where(term ? or(like(societies.name, pattern), like(societies.pincode, pattern)) : undefined)
    .orderBy(societies.name)
    .limit(8)
}

export async function getSocietyBoard(societyId: string, userId: string) {
  const [[members], requests] = await Promise.all([
    db.select({ total: count() }).from(societyMembers).where(eq(societyMembers.societyId, societyId)),
    db
      .select()
      .from(groupRequests)
      .where(eq(groupRequests.societyId, societyId))
      .orderBy(desc(groupRequests.createdAt)),
  ])
  const ids = requests.map((request) => request.id)
  if (ids.length === 0) return { memberCount: members?.total ?? 0, requests: [] }

  const loadOffers = () => db.select().from(groupOffers).where(inArray(groupOffers.requestId, ids))
  let offerRows = await loadOffers()

  // See lib/server/simulator.ts — providers cannot respond without a merchant app.
  if (simulateShops) {
    const quoted = new Set(offerRows.map((offer) => offer.requestId))
    const waiting = requests.filter(
      (request) =>
        request.status === "open" &&
        !quoted.has(request.id) &&
        Date.now() - request.createdAt.getTime() >= timing.groupOfferMs,
    )
    if (waiting.length > 0) {
      await db
        .insert(groupOffers)
        .values(
          waiting.flatMap((request) =>
            groupOffersFor(request.id, request.category).map((offer) => ({ ...offer, requestId: request.id })),
          ),
        )
        .onConflictDoNothing()
      offerRows = await loadOffers()
    }
  }

  const participantRows = await db
    .select({ requestId: groupParticipants.requestId, userId: groupParticipants.userId })
    .from(groupParticipants)
    .where(inArray(groupParticipants.requestId, ids))

  return {
    memberCount: members?.total ?? 0,
    requests: requests.map((request) => {
      const participants = participantRows.filter((row) => row.requestId === request.id)
      const requestOffers = offerRows
        .filter((offer) => offer.requestId === request.id)
        .sort((a, b) => a.pricePerFlat - b.pricePerFlat)
      return {
        request,
        offers: requestOffers,
        selectedOffer: requestOffers.find((offer) => offer.id === request.selectedOfferId) ?? null,
        flatsJoined: participants.length,
        joined: participants.some((row) => row.userId === userId),
      }
    }),
  }
}

export type SocietyBoard = Awaited<ReturnType<typeof getSocietyBoard>>
