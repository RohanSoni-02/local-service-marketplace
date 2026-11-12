import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/server/auth"
import { getLoan, OPEN_STATUSES } from "@/lib/server/listings"
import { AutoRefresh } from "@/components/auto-refresh"
import { LoanView } from "@/components/loan-view"
import { TopBar } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Loan" }

export default async function LoanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser(`/loan/${id}`)
  const loan = await getLoan(id, user.id)
  if (!loan) notFound()
  const live = (OPEN_STATUSES as readonly string[]).includes(loan.rental.status)

  return (
    <>
      <TopBar
        title={loan.listing.title}
        subtitle={loan.role === "owner" ? `Lending to ${loan.other.name}` : `Borrowing from ${loan.other.name}`}
        fallback="/lending"
      />
      {live ? <AutoRefresh intervalMs={3000} /> : null}
      <LoanView loan={loan} />
    </>
  )
}
