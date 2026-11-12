"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus } from "lucide-react"
import { requestLoan, setListingStatus } from "@/lib/actions/listings"
import { formatINR, plural } from "@/lib/format"
import { useAction } from "@/components/use-action"
import { Button } from "@/components/ui/button"
import { buttonClass } from "@/components/ui/button-class"
import { Field, Textarea } from "@/components/ui/field"
import { Row } from "@/components/ui/misc"
import { Sheet } from "@/components/ui/sheet"
import { ActionBar } from "@/components/ui/top-bar"
import { cn } from "@/lib/utils"

type Props = {
  listing: { id: string; title: string; dailyPrice: number; bond: number; status: string; available: boolean }
  viewer: "owner" | "member" | "guest"
}

export function ListingActions({ listing, viewer }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [days, setDays] = useState(1)
  const [note, setNote] = useState("")
  const [pending, run] = useAction()
  const rent = listing.dailyPrice * days

  if (viewer === "owner") {
    const paused = listing.status === "paused"
    return (
      <>
        <ActionBar className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" size="lg" disabled={pending} onClick={() => setRemoving(true)}>
            Remove
          </Button>
          <Button
            variant={paused ? "primary" : "secondary"}
            size="lg"
            pending={pending}
            onClick={() => run(() => setListingStatus(listing.id, paused ? "active" : "paused"))}
          >
            {paused ? "Resume listing" : "Pause listing"}
          </Button>
        </ActionBar>
        <Sheet
          open={removing}
          onOpenChange={setRemoving}
          title="Remove this listing?"
          description="Neighbours will no longer see it. Pending requests are declined."
        >
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="secondary" size="lg" onClick={() => setRemoving(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              size="lg"
              pending={pending}
              onClick={() => run(() => setListingStatus(listing.id, "removed"), () => router.push("/lending"))}
            >
              Remove
            </Button>
          </div>
        </Sheet>
      </>
    )
  }

  const stepper =
    "pressable flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface text-ink hover:bg-sunken disabled:opacity-40"
  const unavailable = listing.status !== "active" || !listing.available

  return (
    <>
      <ActionBar className="flex items-center gap-4">
        <div className="leading-tight">
          <p className="tabular font-display text-xl font-semibold">{formatINR(listing.dailyPrice)}</p>
          <p className="text-xs text-ink-soft">per day</p>
        </div>
        {viewer === "guest" ? (
          <Link
            href={`/login?next=${encodeURIComponent(`/neighbours/${listing.id}`)}`}
            className={cn(buttonClass({ size: "lg" }), "flex-1")}
          >
            Sign in to borrow
          </Link>
        ) : (
          <Button size="lg" className="flex-1" disabled={unavailable} onClick={() => setOpen(true)}>
            {unavailable ? "Not available right now" : "Request to borrow"}
          </Button>
        )}
      </ActionBar>

      <Sheet open={open} onOpenChange={setOpen} title="Request to borrow" description={listing.title}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink">How long?</span>
            <div className="flex items-center gap-3">
              <button type="button" aria-label="One day fewer" disabled={days <= 1} onClick={() => setDays(days - 1)} className={stepper}>
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <output aria-live="polite" className="tabular w-[4.5rem] text-center font-display text-xl font-semibold">
                {plural(days, "day")}
              </output>
              <button type="button" aria-label="One day more" disabled={days >= 14} onClick={() => setDays(days + 1)} className={stepper}>
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <Field label="Message to the owner" htmlFor="loan-note" optional>
            <Textarea
              id="loan-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={300}
              placeholder="House party tonight — can I collect around 6?"
              className="min-h-20"
            />
          </Field>

          <div className="flex flex-col gap-2.5 rounded-xl bg-sunken p-3.5">
            <Row label={`${formatINR(listing.dailyPrice)} × ${plural(days, "day")}`}>{formatINR(rent)}</Row>
            <Row label="Refundable bond">{formatINR(listing.bond)}</Row>
            <div className="border-t border-line-strong pt-2.5">
              <Row label="Hand over at pickup" strong>
                {formatINR(rent + listing.bond)}
              </Row>
            </div>
          </div>

          <Button size="lg" pending={pending} onClick={() => run(() => requestLoan(listing.id, days, note))}>
            Send request
          </Button>
          <p className="-mt-2 text-center text-xs text-ink-soft">Nothing is paid until the owner approves and you collect.</p>
        </div>
      </Sheet>
    </>
  )
}
