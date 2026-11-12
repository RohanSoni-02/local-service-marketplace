import type { Metadata } from "next"
import Link from "next/link"
import { ClipboardList, Star } from "lucide-react"
import { formatDateTime, formatINR, timeAgo } from "@/lib/format"
import { requireUser } from "@/lib/server/auth"
import { ACTIVE_STATUSES, listBookings } from "@/lib/server/bookings"
import { ActivityHeader } from "@/components/activity-header"
import { AutoRefresh } from "@/components/auto-refresh"
import { ShopPhoto } from "@/components/shop-photo"
import { BookingStatusPill } from "@/components/status"
import { buttonClass } from "@/components/ui/button-class"
import { EmptyState } from "@/components/ui/misc"

export const metadata: Metadata = { title: "Activity" }

export default async function BookingsPage() {
  const user = await requireUser("/bookings")
  const rows = await listBookings(user.id)
  const anyLive = rows.some(({ booking }) => (ACTIVE_STATUSES as readonly string[]).includes(booking.status))

  return (
    <>
      <ActivityHeader current="/bookings" />
      {anyLive ? <AutoRefresh intervalMs={5000} /> : null}
      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No visits yet"
          body="When you request a plumber, electrician or any other service, it shows up here."
          action={
            <Link href="/" className={buttonClass()}>
              Browse services
            </Link>
          }
        />
      ) : (
        <ul className="stagger flex flex-col gap-3 px-4 pt-5">
          {rows.map(({ booking, shop, rating }) => (
            <li key={booking.id}>
              <Link
                href={`/booking/${booking.id}`}
                className="pressable flex gap-3.5 rounded-2xl border border-line bg-surface p-3.5 hover:border-line-strong"
              >
                <ShopPhoto shop={shop} sizes="52px" className="size-[52px] shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate font-sans text-[15px] font-semibold tracking-normal text-ink">
                      {booking.issueType}
                    </h2>
                    <BookingStatusPill status={booking.status} />
                  </div>
                  <p className="truncate text-[13px] text-ink-soft">{shop.name}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[13px] text-ink-soft">
                    <span>
                      {booking.scheduledAt && booking.status === "accepted"
                        ? formatDateTime(booking.scheduledAt)
                        : timeAgo(booking.createdAt)}
                    </span>
                    <span className="flex items-center gap-2.5">
                      {rating ? (
                        <span className="tabular inline-flex items-center gap-1 font-semibold text-ink">
                          <Star className="size-3.5 fill-marigold text-marigold" aria-hidden="true" />
                          {rating}
                        </span>
                      ) : null}
                      {booking.price != null ? (
                        <span className="tabular font-semibold text-ink">{formatINR(booking.price)}</span>
                      ) : null}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
