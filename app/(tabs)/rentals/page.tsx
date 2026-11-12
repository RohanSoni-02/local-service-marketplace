import type { Metadata } from "next"
import Link from "next/link"
import { Drill } from "lucide-react"
import { formatDateTime, formatINR, formatTime, plural, timeAgo } from "@/lib/format"
import { requireUser } from "@/lib/server/auth"
import { listRentals } from "@/lib/server/rentals"
import { listActiveReservations } from "@/lib/server/stock"
import { ActivityHeader } from "@/components/activity-header"
import { RentalStatusPill } from "@/components/status"
import { ToolPhoto } from "@/components/tool-row"
import { buttonClass } from "@/components/ui/button-class"
import { EmptyState, Pill } from "@/components/ui/misc"

export const metadata: Metadata = { title: "Rentals" }

export default async function RentalsPage() {
  const user = await requireUser("/rentals")
  const [rentals, holds] = await Promise.all([listRentals(user.id), listActiveReservations(user.id)])

  return (
    <>
      <ActivityHeader current="/rentals" />
      {rentals.length === 0 && holds.length === 0 ? (
        <EmptyState
          icon={Drill}
          title="Nothing rented yet"
          body="Tools you rent and parts you put on hold at a shop will appear here."
          action={
            <Link href="/category/tool-rental" className={buttonClass()}>
              Browse tools
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-6 px-4 pt-5">
          {holds.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-[17px] font-semibold">Parts on hold</h2>
              <ul className="stagger flex flex-col gap-3">
                {holds.map(({ reservation, shop }) => (
                  <li key={reservation.id}>
                    <Link
                      href={`/reservation/${reservation.id}`}
                      className="pressable flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3.5 hover:border-line-strong"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-ink">{reservation.productName}</p>
                        <p className="truncate text-[13px] text-ink-soft">
                          {shop.name} · {formatINR(reservation.price)}
                        </p>
                      </div>
                      <Pill tone="marigold">Until {formatTime(reservation.expiresAt)}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {rentals.length > 0 ? (
            <section className="flex flex-col gap-3">
              {holds.length > 0 ? <h2 className="text-[17px] font-semibold">Tool rentals</h2> : null}
              <ul className="stagger flex flex-col gap-3">
                {rentals.map(({ rental, tool, shop }) => (
                  <li key={rental.id}>
                    <Link
                      href={`/rental/${rental.id}`}
                      className="pressable flex gap-3.5 rounded-2xl border border-line bg-surface p-3.5 hover:border-line-strong"
                    >
                      <ToolPhoto tool={tool} sizes="52px" className="size-[52px] border border-line" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate font-sans text-[15px] font-semibold tracking-normal text-ink">{tool.name}</h3>
                          <RentalStatusPill status={rental.status} />
                        </div>
                        <p className="truncate text-[13px] text-ink-soft">
                          {shop.name} · {plural(rental.days, "day")}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[13px] text-ink-soft">
                          <span>
                            {rental.status === "active" && rental.dueAt
                              ? `Due ${formatDateTime(rental.dueAt)}`
                              : rental.status === "returned" && rental.returnedAt
                                ? `Returned ${timeAgo(rental.returnedAt).toLowerCase()}`
                                : `Reserved ${timeAgo(rental.createdAt).toLowerCase()}`}
                          </span>
                          <span className="tabular font-semibold text-ink">
                            {formatINR(rental.dailyPrice * rental.days)}
                          </span>
                        </div>
                      </div>
                    </Link>
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
