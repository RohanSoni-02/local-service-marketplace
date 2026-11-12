"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { CalendarClock, Clock, MapPin, MessageCircle, Phone, Star, Wallet, X } from "lucide-react"
import { acceptOffer, cancelBooking, counterOffer, declineOffer, submitReview } from "@/lib/actions/bookings"
import { formatDateTime, formatDistance, formatINR, plural } from "@/lib/format"
import type { BookingDetail, OfferView } from "@/lib/server/bookings"
import { Countdown } from "@/components/countdown"
import { Radar } from "@/components/radar"
import { ShopPhoto } from "@/components/shop-photo"
import { Timeline, type TimelineStep } from "@/components/status"
import { TierBadge } from "@/components/tier-badge"
import { useAction } from "@/components/use-action"
import { Button, Spinner, SubmitButton } from "@/components/ui/button"
import { buttonClass } from "@/components/ui/button-class"
import { Field, FormError, Input, Textarea } from "@/components/ui/field"
import { Card, Rating, SectionTitle } from "@/components/ui/misc"
import { Sheet } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function BookingView({ detail }: { detail: BookingDetail }) {
  const { booking, shop, offers, now } = detail
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, run] = useAction()
  const cancellable = booking.status === "broadcasting" || booking.status === "accepted"

  return (
    <main className="flex flex-col gap-6 px-4 pb-10 pt-5">
      {booking.status === "broadcasting" ? <Broadcasting detail={detail} /> : null}

      {booking.status === "cancelled" || booking.status === "expired" ? (
        <Card className="animate-rise p-5 text-center">
          <h2 className="text-xl font-semibold">
            {booking.status === "cancelled" ? "Request cancelled" : "No shop picked this up"}
          </h2>
          <p className="mx-auto mt-1 max-w-[32ch] text-sm text-ink-soft">
            {booking.status === "cancelled"
              ? "Nothing was charged. You can send a new request whenever you're ready."
              : "Shops nearby were busy. Try again, or schedule a slot later today."}
          </p>
          <Link href={`/shop/${booking.shopId}/book`} className={buttonClass({ className: "mt-4" })}>
            Request again
          </Link>
        </Card>
      ) : null}

      {booking.assignedShopId ? (
        <>
          <Card className="animate-rise overflow-hidden">
            <div className="flex items-center gap-3.5 p-4">
              <ShopPhoto shop={shop} sizes="56px" className="size-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <Link href={`/shop/${shop.id}`} className="block truncate text-base font-semibold text-ink">
                  {shop.name}
                </Link>
                <div className="mt-0.5 flex items-center gap-2 text-[13px] text-ink-soft">
                  <Rating value={shop.rating} />
                  <span aria-hidden="true">·</span>
                  {formatDistance(shop.distanceKm)}
                </div>
              </div>
              {booking.price != null ? (
                <div className="text-right leading-tight">
                  <p className="text-xs text-ink-soft">Agreed price</p>
                  <p className="tabular font-display text-xl font-semibold text-ink">{formatINR(booking.price)}</p>
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 divide-x divide-line border-t border-line">
              <Link href={`/chat/${shop.id}`} className="pressable flex h-12 items-center justify-center gap-2 text-sm font-semibold text-brand-deep hover:bg-sunken">
                <MessageCircle className="size-4" aria-hidden="true" />
                Message
              </Link>
              <a href={`tel:+91${shop.phone}`} className="pressable flex h-12 items-center justify-center gap-2 text-sm font-semibold text-brand-deep hover:bg-sunken">
                <Phone className="size-4" aria-hidden="true" />
                Call
              </a>
            </div>
          </Card>

          {booking.status !== "cancelled" ? (
            <Card className="p-4">
              <Timeline steps={timelineFor(detail)} />
            </Card>
          ) : null}
        </>
      ) : null}

      {booking.status === "completed" ? <ReviewCard detail={detail} /> : null}

      <section className="flex flex-col gap-3">
        <SectionTitle>Request details</SectionTitle>
        <Card className="flex flex-col gap-3.5 p-4">
          <p className="text-[15px] leading-relaxed text-ink">{booking.description}</p>
          <ul className="flex flex-col gap-2.5 border-t border-line pt-3.5 text-sm text-ink-soft">
            <li className="flex gap-2.5">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              {booking.scheduledAt ? formatDateTime(booking.scheduledAt, new Date(now)) : "As soon as possible"}
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              {booking.address}
            </li>
            {booking.budget != null ? (
              <li className="flex gap-2.5">
                <Wallet className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                Budget up to {formatINR(booking.budget)}
              </li>
            ) : null}
          </ul>
        </Card>
      </section>

      {cancellable ? (
        <Button variant="ghost" className="self-center text-danger hover:bg-danger-soft hover:text-danger" onClick={() => setCancelOpen(true)}>
          Cancel request
        </Button>
      ) : null}

      <Sheet
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this request?"
        description={
          booking.status === "accepted"
            ? `${shop.name} has already confirmed. They'll be told you no longer need the visit.`
            : "Shops will stop sending offers. You won't be charged."
        }
      >
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" size="lg" onClick={() => setCancelOpen(false)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            size="lg"
            pending={cancelling}
            onClick={() => run(() => cancelBooking(booking.id), () => setCancelOpen(false))}
          >
            Cancel request
          </Button>
        </div>
      </Sheet>

      {offers.length === 0 ? null : <span className="sr-only" aria-live="polite">{plural(offers.length, "offer")} received</span>}
    </main>
  )
}

function timelineFor({ booking, shop, broadcastCount }: BookingDetail): TimelineStep[] {
  const order = ["broadcasting", "accepted", "on_the_way", "completed"]
  const at = order.indexOf(booking.status)
  const state = (index: number): TimelineStep["state"] =>
    booking.status === "completed" || index < at ? "done" : index === at ? "active" : "upcoming"
  return [
    { label: `Sent to ${plural(broadcastCount, "shop")} nearby`, state: "done" },
    {
      label: `Confirmed by ${shop.name}`,
      detail: booking.acceptedAt ? formatDateTime(booking.acceptedAt) : undefined,
      state: state(1),
    },
    {
      label: "Technician on the way",
      detail:
        booking.status === "on_the_way" && booking.etaMinutes
          ? `Arriving in about ${booking.etaMinutes} minutes`
          : booking.status === "accepted" && booking.scheduledAt
            ? `Scheduled for ${formatDateTime(booking.scheduledAt)}`
            : undefined,
      state: state(2),
    },
    {
      label: "Job completed",
      detail:
        booking.status === "completed" && booking.price != null
          ? `Pay ${formatINR(booking.price)} to the shop by cash or UPI`
          : undefined,
      state: state(3),
    },
  ]
}

function Broadcasting({ detail }: { detail: BookingDetail }) {
  const { booking, offers, broadcastCount, offersCloseAt, now } = detail
  const open = offers.filter((offer) => offer.status !== "declined").sort((a, b) => a.price - b.price)
  const declined = offers.filter((offer) => offer.status === "declined")

  return (
    <>
      <section className="flex flex-col items-center gap-4 pt-2 text-center">
        <Radar total={broadcastCount} responded={booking.allowNegotiation ? offers.length : 0} />
        <div>
          <h2 className="text-[22px] font-semibold leading-tight">
            {offers.length > 0 ? `${plural(offers.length, "offer")} so far` : "Finding shops near you"}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Sent to {plural(broadcastCount, "shop")} within 5 km.{" "}
            {booking.allowNegotiation ? (
              <>
                Offers close in{" "}
                <Countdown
                  until={offersCloseAt.getTime()}
                  initialMs={offersCloseAt.getTime() - now}
                  className="font-semibold text-ink"
                />
              </>
            ) : (
              "The first to accept gets the job."
            )}
          </p>
        </div>
      </section>

      {booking.allowNegotiation ? (
        <section className="flex flex-col gap-3" aria-label="Offers">
          {open.map((offer) => (
            <OfferCard key={offer.id} offer={offer} budget={booking.budget} />
          ))}
          {offers.length < broadcastCount ? (
            <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-dashed border-line-strong py-4 text-sm text-ink-soft">
              <Spinner className="text-brand" />
              Waiting on {plural(broadcastCount - offers.length, "more shop")}
            </div>
          ) : null}
          {declined.length > 0 ? (
            <p className="text-center text-[13px] text-ink-faint">
              You declined {declined.map((offer) => offer.shop.name).join(", ")}
            </p>
          ) : null}
        </section>
      ) : null}
    </>
  )
}

function OfferCard({ offer, budget }: { offer: OfferView; budget: number | null }) {
  const [pending, run] = useAction()
  const [counterOpen, setCounterOpen] = useState(false)
  const suggested = Math.max(50, Math.round((offer.price * 0.9) / 10) * 10)
  const [amount, setAmount] = useState(String(suggested))
  const withinBudget = budget != null && offer.price <= budget

  return (
    <Card className={cn("animate-rise p-4 transition-opacity duration-200", pending && "opacity-70")}>
      <div className="flex items-start gap-3.5">
        <ShopPhoto shop={offer.shop} sizes="48px" className="size-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <Link href={`/shop/${offer.shop.id}`} className="block truncate text-[15px] font-semibold text-ink">
            {offer.shop.name}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-soft">
            <Rating value={offer.shop.rating} />
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {offer.etaMinutes} min away
            </span>
          </div>
        </div>
        <div className="text-right leading-tight">
          <p className="tabular font-display text-[22px] font-semibold text-ink">{formatINR(offer.price)}</p>
          {withinBudget ? <p className="text-xs font-medium text-brand">Within budget</p> : null}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <TierBadge tier={offer.shop.tier} />
      </div>

      {offer.status === "countered" ? (
        <p className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-marigold-soft px-3.5 py-3 text-sm font-medium text-marigold-ink">
          <Spinner />
          You offered {formatINR(offer.counterPrice ?? 0)}. Waiting for the shop to reply.
        </p>
      ) : (
        <>
          {offer.status === "firm" ? (
            <p className="mt-3.5 rounded-xl bg-sunken px-3.5 py-3 text-sm text-ink-soft">
              The shop couldn&apos;t do {formatINR(offer.counterPrice ?? 0)} and is holding at{" "}
              <span className="font-semibold text-ink">{formatINR(offer.price)}</span>.
            </p>
          ) : null}
          <div className="mt-3.5 flex gap-2">
            <Button className="flex-1" disabled={pending} onClick={() => run(() => acceptOffer(offer.id))}>
              Accept {formatINR(offer.price)}
            </Button>
            {offer.status === "pending" ? (
              <Button variant="outline" disabled={pending} onClick={() => setCounterOpen(true)}>
                Counter
              </Button>
            ) : null}
            <Button
              variant="ghost"
              aria-label={`Decline offer from ${offer.shop.name}`}
              className="w-11 px-0"
              disabled={pending}
              onClick={() => run(() => declineOffer(offer.id))}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        </>
      )}

      <Sheet
        open={counterOpen}
        onOpenChange={setCounterOpen}
        title="Counter this offer"
        description={`${offer.shop.name} quoted ${formatINR(offer.price)}. You can counter once.`}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            run(() => counterOffer(offer.id, Number(amount)), () => setCounterOpen(false))
          }}
        >
          <Field label="Your price" htmlFor={`counter-${offer.id}`}>
            <Input
              id={`counter-${offer.id}`}
              inputMode="numeric"
              pattern="[0-9]*"
              prefix="₹"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
              className="tabular font-display text-xl font-semibold"
            />
          </Field>
          <Button type="submit" size="lg" pending={pending} disabled={!amount || Number(amount) >= offer.price}>
            Send counter-offer
          </Button>
        </form>
      </Sheet>
    </Card>
  )
}

function ReviewCard({ detail }: { detail: BookingDetail }) {
  const { booking, shop, review } = detail
  const [state, action] = useActionState(submitReview, {})
  const [rating, setRating] = useState(0)

  if (review) {
    return (
      <Card className="p-4">
        <p className="text-[13px] font-semibold text-ink-soft">Your review</p>
        <div className="mt-1.5 flex gap-1" aria-label={`You rated ${review.rating} out of 5`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              className={cn("size-5", value <= review.rating ? "fill-marigold text-marigold" : "text-line-strong")}
              aria-hidden="true"
            />
          ))}
        </div>
        {review.text ? <p className="mt-2 text-sm leading-relaxed text-ink">{review.text}</p> : null}
      </Card>
    )
  }

  return (
    <Card className="animate-rise p-4">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="bookingId" value={booking.id} />
        <input type="hidden" name="rating" value={rating} />
        <div>
          <h2 className="text-lg font-semibold">How was {shop.name}?</h2>
          <p className="text-[13px] text-ink-soft">Your rating helps neighbours choose well.</p>
        </div>
        <div role="radiogroup" aria-label="Rating" className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={plural(value, "star")}
              onClick={() => setRating(value)}
              className="pressable flex size-11 items-center justify-center rounded-xl active:scale-90"
            >
              <Star
                className={cn(
                  "size-8 transition-colors duration-150",
                  value <= rating ? "fill-marigold text-marigold" : "text-line-strong",
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        {state.fieldErrors?.rating ? <p className="-mt-2 text-[13px] text-danger">{state.fieldErrors.rating}</p> : null}
        <Textarea name="text" aria-label="Review" maxLength={500} placeholder="What went well? Anything to improve?" className="min-h-20" />
        <FormError message={state.error} />
        <SubmitButton disabled={rating === 0}>Submit review</SubmitButton>
      </form>
    </Card>
  )
}
