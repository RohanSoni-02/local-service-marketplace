"use client"

import Link from "next/link"
import { MapPin, MessageCircle, Navigation } from "lucide-react"
import { cancelRental, confirmPickup, returnRental } from "@/lib/actions/rentals"
import type { Rental, Tool } from "@/lib/db/schema"
import { formatDateTime, formatINR, plural } from "@/lib/format"
import { directionsUrl } from "@/lib/geo"
import type { ShopListing } from "@/lib/server/shops"
import { RentalStatusPill } from "@/components/status"
import { ToolPhoto } from "@/components/tool-row"
import { useAction } from "@/components/use-action"
import { Button } from "@/components/ui/button"
import { buttonClass } from "@/components/ui/button-class"
import { Card, Row } from "@/components/ui/misc"

const headlines: Record<Rental["status"], { title: string; body: (shop: string) => string }> = {
  reserved: { title: "Reserved for you", body: (shop) => `Show this code at ${shop} to collect the tool.` },
  active: { title: "It's with you", body: () => "Return it by the due time to get your full deposit back." },
  returned: { title: "Returned", body: (shop) => `${shop} has your tool back. Deposit refunded at the counter.` },
  cancelled: { title: "Reservation cancelled", body: () => "Nothing was charged." },
}

export function RentalView({ rental, tool, shop }: { rental: Rental; tool: Tool; shop: ShopListing }) {
  const [pending, run] = useAction()
  const rent = rental.dailyPrice * rental.days
  const headline = headlines[rental.status]

  return (
    <main className="flex flex-col gap-5 px-4 pb-10 pt-5">
      <Card className="flex animate-rise flex-col items-center gap-4 p-6 text-center">
        <RentalStatusPill status={rental.status} />
        {rental.status === "reserved" ? (
          <p
            aria-label={`Pickup code ${rental.pickupCode.split("").join(" ")}`}
            className="tabular font-display text-[56px] font-bold leading-none tracking-[0.12em] text-ink"
          >
            {rental.pickupCode}
          </p>
        ) : (
          <ToolPhoto tool={tool} sizes="120px" className="size-28 rounded-2xl border border-line" />
        )}
        <div>
          <h2 className="text-xl font-semibold">{headline.title}</h2>
          <p className="mx-auto mt-1 max-w-[30ch] text-sm text-ink-soft">{headline.body(shop.name)}</p>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <Row label="Rental period">{plural(rental.days, "day")}</Row>
        {rental.pickedUpAt ? <Row label="Picked up">{formatDateTime(rental.pickedUpAt)}</Row> : null}
        {rental.dueAt && rental.status === "active" ? <Row label="Due back">{formatDateTime(rental.dueAt)}</Row> : null}
        {rental.returnedAt ? <Row label="Returned">{formatDateTime(rental.returnedAt)}</Row> : null}
        <Row label="Rent">{formatINR(rent)}</Row>
        <Row label={rental.status === "returned" ? "Deposit refunded" : "Refundable deposit"}>
          {formatINR(rental.deposit)}
        </Row>
        {rental.status === "reserved" ? (
          <div className="border-t border-line pt-3">
            <Row label="Pay at pickup" strong>
              {formatINR(rent + rental.deposit)}
            </Row>
          </div>
        ) : null}
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
        <div className="grid grid-cols-2 divide-x divide-line border-t border-line">
          <a
            href={directionsUrl(shop)}
            target="_blank"
            rel="noreferrer"
            className="pressable flex h-12 items-center justify-center gap-2 text-sm font-semibold text-brand-deep hover:bg-sunken"
          >
            <Navigation className="size-4" aria-hidden="true" />
            Directions
          </a>
          <Link
            href={`/chat/${shop.id}`}
            className="pressable flex h-12 items-center justify-center gap-2 text-sm font-semibold text-brand-deep hover:bg-sunken"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Message
          </Link>
        </div>
      </Card>

      {rental.status === "reserved" ? (
        <div className="flex flex-col gap-2">
          <Button size="lg" pending={pending} onClick={() => run(() => confirmPickup(rental.id))}>
            I&apos;ve picked it up
          </Button>
          <Button
            variant="ghost"
            className="text-danger hover:bg-danger-soft hover:text-danger"
            disabled={pending}
            onClick={() => run(() => cancelRental(rental.id))}
          >
            Cancel reservation
          </Button>
        </div>
      ) : null}
      {rental.status === "active" ? (
        <Button size="lg" pending={pending} onClick={() => run(() => returnRental(rental.id))}>
          I&apos;ve returned it
        </Button>
      ) : null}
      {rental.status === "returned" || rental.status === "cancelled" ? (
        <Link href={`/shop/${shop.id}`} className={buttonClass({ variant: "outline", size: "lg" })}>
          Rent from {shop.name} again
        </Link>
      ) : null}
    </main>
  )
}
