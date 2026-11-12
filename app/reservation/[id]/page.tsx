import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Navigation } from "lucide-react"
import { formatINR, formatTime } from "@/lib/format"
import { directionsUrl } from "@/lib/geo"
import { requireUser } from "@/lib/server/auth"
import { getReservation } from "@/lib/server/stock"
import { CancelHoldButton } from "@/components/cancel-hold-button"
import { Countdown } from "@/components/countdown"
import { buttonClass } from "@/components/ui/button-class"
import { Card, Pill, Row } from "@/components/ui/misc"
import { TopBar } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Item on hold" }

export default async function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser(`/reservation/${id}`)
  const detail = await getReservation(id, user.id)
  if (!detail) notFound()
  const { reservation, shop, remainingMs: remaining } = detail
  const state = reservation.status === "cancelled" ? "cancelled" : remaining <= 0 ? "expired" : "held"

  return (
    <>
      <TopBar title={reservation.productName} subtitle={shop.name} fallback="/rentals" />
      <main className="flex flex-col gap-5 px-4 pb-10 pt-5">
        <Card className="flex animate-rise flex-col items-center gap-4 p-6 text-center">
          {state === "held" ? (
            <>
              <Pill tone="marigold">
                Held for <Countdown until={reservation.expiresAt.getTime()} initialMs={remaining} />
              </Pill>
              <p
                aria-label={`Pickup code ${reservation.pickupCode.split("").join(" ")}`}
                className="tabular font-display text-[56px] font-bold leading-none tracking-[0.12em]"
              >
                {reservation.pickupCode}
              </p>
              <div>
                <h2 className="text-xl font-semibold">On hold at the counter</h2>
                <p className="mx-auto mt-1 max-w-[30ch] text-sm text-ink-soft">
                  Show this code at {shop.name} before {formatTime(reservation.expiresAt)} and pay there.
                </p>
              </div>
            </>
          ) : (
            <>
              <Pill tone={state === "cancelled" ? "danger" : "neutral"}>{state === "cancelled" ? "Cancelled" : "Hold ended"}</Pill>
              <div>
                <h2 className="text-xl font-semibold">
                  {state === "cancelled" ? "You released this item" : "This hold has lapsed"}
                </h2>
                <p className="mx-auto mt-1 max-w-[30ch] text-sm text-ink-soft">
                  It&apos;s back on the shelf. Search again to see if it&apos;s still in stock.
                </p>
              </div>
              <Link href={`/search?q=${encodeURIComponent(reservation.productName)}`} className={buttonClass()}>
                Check stock again
              </Link>
            </>
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <Row label="Item">{reservation.productName}</Row>
          <Row label="Quantity">1</Row>
          <div className="border-t border-line pt-3">
            <Row label="Pay at the shop" strong>
              {formatINR(reservation.price)}
            </Row>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex gap-3 p-4">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-semibold text-ink">{shop.name}</p>
              <p className="text-ink-soft">
                {shop.area} · {shop.hours}
              </p>
            </div>
          </div>
          <a
            href={directionsUrl(shop)}
            target="_blank"
            rel="noreferrer"
            className="pressable flex h-12 items-center justify-center gap-2 border-t border-line text-sm font-semibold text-brand-deep hover:bg-sunken"
          >
            <Navigation className="size-4" aria-hidden="true" />
            Get directions
          </a>
        </Card>

        {state === "held" ? <CancelHoldButton reservationId={reservation.id} /> : null}
      </main>
    </>
  )
}
