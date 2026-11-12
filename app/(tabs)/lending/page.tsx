import type { Metadata } from "next"
import Link from "next/link"
import { HandHeart, Plus } from "lucide-react"
import { formatINR, plural, timeAgo } from "@/lib/format"
import { requireUser } from "@/lib/server/auth"
import { listLoans, listOwnListings, OPEN_STATUSES, type Loan } from "@/lib/server/listings"
import { ActivityHeader } from "@/components/activity-header"
import { AutoRefresh } from "@/components/auto-refresh"
import { ListingPhoto } from "@/components/listing-bits"
import { LoanStatusPill } from "@/components/loan-view"
import { buttonClass } from "@/components/ui/button-class"
import { EmptyState, Pill } from "@/components/ui/misc"

export const metadata: Metadata = { title: "Neighbour lending" }

function LoanRow({ loan }: { loan: Loan }) {
  const { rental, listing, role, other } = loan
  return (
    <Link
      href={`/loan/${rental.id}`}
      className="pressable flex gap-3.5 rounded-2xl border border-line bg-surface p-3.5 hover:border-line-strong"
    >
      <ListingPhoto listing={listing} sizes="52px" className="size-[52px] rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-sans text-[15px] font-semibold tracking-normal text-ink">{listing.title}</h3>
          <LoanStatusPill status={rental.status} />
        </div>
        <p className="truncate text-[13px] text-ink-soft">
          {role === "owner" ? `To ${other.name}` : `From ${other.name}`} · {plural(rental.days, "day")}
        </p>
        <div className="mt-1.5 flex items-center justify-between text-[13px] text-ink-soft">
          <span>{timeAgo(rental.createdAt)}</span>
          <span className="tabular font-semibold text-ink">{formatINR(rental.dailyPrice * rental.days)}</span>
        </div>
      </div>
    </Link>
  )
}

export default async function LendingPage() {
  const user = await requireUser("/lending")
  const [loans, listings] = await Promise.all([listLoans(user.id), listOwnListings(user.id)])
  const isOpen = (loan: Loan) => (OPEN_STATUSES as readonly string[]).includes(loan.rental.status)
  const incoming = loans.filter((loan) => loan.role === "owner" && isOpen(loan))
  const borrowing = loans.filter((loan) => loan.role === "renter" && isOpen(loan))
  const past = loans.filter((loan) => !isOpen(loan))
  const empty = loans.length === 0 && listings.length === 0

  return (
    <>
      <ActivityHeader current="/lending" />
      {loans.some(isOpen) ? <AutoRefresh intervalMs={5000} /> : null}
      {empty ? (
        <EmptyState
          icon={HandHeart}
          title="Lend and borrow next door"
          body="Borrow a PS5 for tonight, or earn from the ladder in your storeroom."
          action={
            <div className="flex gap-2.5">
              <Link href="/neighbours" className={buttonClass()}>
                Browse items
              </Link>
              <Link href="/neighbours/new" className={buttonClass({ variant: "outline" })}>
                Lend an item
              </Link>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-7 px-4 pt-5">
          {incoming.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-[17px] font-semibold">Requests for your items</h2>
              <ul className="stagger flex flex-col gap-3">
                {incoming.map((loan) => (
                  <li key={loan.rental.id}>
                    <LoanRow loan={loan} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {borrowing.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-[17px] font-semibold">You&apos;re borrowing</h2>
              <ul className="stagger flex flex-col gap-3">
                {borrowing.map((loan) => (
                  <li key={loan.rental.id}>
                    <LoanRow loan={loan} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-semibold">Your listings</h2>
              <Link href="/neighbours/new" className={buttonClass({ size: "sm" })}>
                <Plus aria-hidden="true" />
                Lend an item
              </Link>
            </div>
            {listings.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line-strong px-4 py-5 text-center text-sm text-ink-soft">
                Nothing listed yet. Idle speakers, ladders and consoles all rent well.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {listings.map((listing) => (
                  <li key={listing.id}>
                    <Link
                      href={`/neighbours/${listing.id}`}
                      className="pressable flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3 hover:border-line-strong"
                    >
                      <ListingPhoto listing={listing} sizes="52px" className="size-[52px] rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-sans text-[15px] font-semibold tracking-normal text-ink">{listing.title}</h3>
                        <p className="text-[13px] text-ink-soft">
                          {formatINR(listing.dailyPrice)} / day · {formatINR(listing.bond)} bond
                        </p>
                      </div>
                      {listing.status === "paused" ? (
                        <Pill tone="danger">Paused</Pill>
                      ) : listing.available ? (
                        <Pill tone="brand">Live</Pill>
                      ) : (
                        <Pill tone="solid">On loan</Pill>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-[17px] font-semibold">Past loans</h2>
              <ul className="flex flex-col gap-3">
                {past.map((loan) => (
                  <li key={loan.rental.id}>
                    <LoanRow loan={loan} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </>
  )
}
