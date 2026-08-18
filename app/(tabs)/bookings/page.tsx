import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ClipboardList } from "lucide-react"
import { bookingHistory, getShop } from "@/lib/mock-data"
import { StatusPill } from "@/components/status-pill"
import { StarRating } from "@/components/star-rating"
import { formatINR } from "@/lib/format"

export default function BookingsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card px-4 pb-3 pt-4">
        <h1 className="font-heading text-[19px] font-bold text-foreground">My Bookings</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {bookingHistory.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <ClipboardList className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-[13.5px] font-medium text-foreground">No bookings yet</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {bookingHistory.map((booking) => {
              const shop = getShop(booking.shopId)
              if (!shop) return null
              return (
                <li key={booking.id}>
                  <Link
                    href={booking.status === "cancelled" ? "#" : `/chat/${shop.id}`}
                    className="flex flex-col gap-3 rounded-2xl bg-card p-3.5 shadow-sm ring-1 ring-border active:opacity-90"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image src={shop.photo || "/placeholder.svg"} alt={shop.name} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13.5px] font-semibold text-foreground">{shop.name}</span>
                          <StatusPill status={booking.status} />
                        </div>
                        <span className="text-[12.5px] text-muted-foreground">{booking.issueType}</span>
                        <span className="text-[11.5px] text-muted-foreground">
                          {booking.mode === "Scheduled" ? booking.scheduledFor : booking.createdAt}
                        </span>
                      </div>
                    </div>

                    {booking.status === "completed" && (
                      <div className="flex items-center justify-between border-t border-border pt-2.5">
                        <div className="flex items-center gap-2">
                          {booking.userRating ? <StarRating rating={booking.userRating} size="sm" /> : null}
                          {booking.cost ? (
                            <span className="text-[12px] font-semibold text-foreground">{formatINR(booking.cost)}</span>
                          ) : null}
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
