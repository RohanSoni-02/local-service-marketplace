import type { Metadata } from "next"
import { requireUser } from "@/lib/server/auth"
import { getMembership, getSocietyBoard, searchSocieties } from "@/lib/server/society"
import { AutoRefresh } from "@/components/auto-refresh"
import { SocietyBoardView } from "@/components/society-board"
import { SocietyOnboarding } from "@/components/society-onboarding"

export const metadata: Metadata = { title: "Society" }

export default async function SocietyPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser("/society")
  const membership = await getMembership(user.id)

  if (!membership) {
    const query = ((await searchParams).q ?? "").slice(0, 60)
    return <SocietyOnboarding query={query} societies={await searchSocieties(query)} />
  }

  const board = await getSocietyBoard(membership.society.id, user.id)
  const awaitingOffers = board.requests.some(({ request, offers }) => request.status === "open" && offers.length === 0)

  return (
    <>
      {awaitingOffers ? <AutoRefresh intervalMs={4000} /> : null}
      <SocietyBoardView
        society={membership.society}
        member={{ flat: membership.member.flat, role: membership.member.role }}
        board={board}
        today={new Date().toISOString().slice(0, 10)}
      />
    </>
  )
}
