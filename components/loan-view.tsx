"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { MessageSquareQuote, Phone, ShieldAlert, ShieldCheck } from "lucide-react"
import { cancelLoan, confirmHandover, markLoanReturned, respondToLoan, settleLoan } from "@/lib/actions/listings"
import type { FormState } from "@/lib/actions/types"
import type { PeerRentalStatus } from "@/lib/db/schema"
import { formatDateTime, formatINR, plural } from "@/lib/format"
import type { Loan } from "@/lib/server/listings"
import { ListingPhoto } from "@/components/listing-bits"
import { useAction } from "@/components/use-action"
import { Button, SubmitButton } from "@/components/ui/button"
import { buttonClass } from "@/components/ui/button-class"
import { Field, FormError, Input, Textarea } from "@/components/ui/field"
import { Card, Pill, Row } from "@/components/ui/misc"
import { Segmented } from "@/components/ui/segmented"
import { Sheet } from "@/components/ui/sheet"

const pills: Record<PeerRentalStatus, { label: string; tone: "neutral" | "brand" | "marigold" | "danger" | "solid" }> = {
  requested: { label: "Awaiting approval", tone: "marigold" },
  approved: { label: "Ready for pickup", tone: "brand" },
  active: { label: "On loan", tone: "solid" },
  returned: { label: "Awaiting check-in", tone: "marigold" },
  closed: { label: "Completed", tone: "neutral" },
  declined: { label: "Declined", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "danger" },
}

export function LoanStatusPill({ status }: { status: PeerRentalStatus }) {
  return <Pill tone={pills[status].tone}>{pills[status].label}</Pill>
}

function headline({ rental, role, other }: Loan): { title: string; body: string } {
  const total = formatINR(rental.dailyPrice * rental.days + rental.bond)
  const bond = formatINR(rental.bond)
  if (role === "renter") {
    switch (rental.status) {
      case "requested":
        return { title: `Waiting for ${other.name}`, body: "You'll get a handover code as soon as they approve." }
      case "approved":
        return { title: "Approved — go collect it", body: `Show this code to ${other.name} and hand over ${total} (rent plus bond).` }
      case "active":
        return { title: "It's with you", body: `${other.name} is holding your ${bond} bond until it's back.` }
      case "returned":
        return { title: "Returned — bond pending", body: `${other.name} is checking the item before releasing your bond.` }
      case "closed":
        return rental.bondWithheld > 0
          ? { title: "Loan closed with a deduction", body: `${other.name} kept part of your bond. The reason is below.` }
          : { title: "All done", body: rental.bond > 0 ? `Your full ${bond} bond was returned.` : "Thanks for borrowing locally." }
      case "declined":
        return { title: "Not this time", body: `${other.name} couldn't lend it for these dates.` }
      default:
        return { title: "Request cancelled", body: "Nothing was paid." }
    }
  }
  switch (rental.status) {
    case "requested":
      return { title: `${other.name} wants to borrow this`, body: `For ${plural(rental.days, "day")}. Approve to share a pickup code.` }
    case "approved":
      return { title: "Hand it over", body: `Collect ${total} from ${other.name}, then enter their 4-digit code.` }
    case "active":
      return { title: `On loan to ${other.name}`, body: `You're holding their ${bond} bond.` }
    case "returned":
      return { title: `${other.name} says it's back`, body: "Check it over, then settle the bond." }
    case "closed":
      return { title: "Loan settled", body: rental.bondWithheld > 0 ? "You kept part of the bond for damage." : "Bond returned in full." }
    case "declined":
      return { title: "You declined this request", body: "The borrower has been told." }
    default:
      return { title: "The borrower cancelled", body: "Your item is free again." }
  }
}

export function LoanView({ loan }: { loan: Loan }) {
  const { rental, listing, role, other } = loan
  const [pending, run] = useAction()
  const [code, setCode] = useState("")
  const [settling, setSettling] = useState(false)
  const rent = rental.dailyPrice * rental.days
  const { title, body } = headline(loan)

  return (
    <main className="flex flex-col gap-5 px-4 pb-10 pt-5">
      <Card className="flex animate-rise flex-col items-center gap-4 p-6 text-center">
        <LoanStatusPill status={rental.status} />
        {role === "renter" && rental.status === "approved" ? (
          <p
            aria-label={`Handover code ${rental.handoverCode.split("").join(" ")}`}
            className="tabular font-display text-[56px] font-bold leading-none tracking-[0.12em]"
          >
            {rental.handoverCode}
          </p>
        ) : (
          <ListingPhoto listing={listing} sizes="112px" className="size-28 rounded-2xl border border-line" />
        )}
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mx-auto mt-1 max-w-[32ch] text-sm text-ink-soft">{body}</p>
        </div>
      </Card>

      {rental.note && (rental.status === "requested" || rental.status === "approved") ? (
        <p className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink">
          <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
          <span>
            <span className="block text-xs font-semibold text-ink-soft">{role === "owner" ? other.name : "Your message"}</span>
            {rental.note}
          </span>
        </p>
      ) : null}

      {rental.status === "closed" && rental.bond > 0 ? (
        rental.bondWithheld > 0 ? (
          <div className="rounded-2xl bg-danger-soft p-4 text-danger">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <ShieldAlert className="size-[18px]" aria-hidden="true" />
              {formatINR(rental.bondWithheld)} of the bond was kept
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">“{rental.claimNote}”</p>
            <p className="mt-2 text-[13px] text-ink-soft">
              {role === "renter"
                ? `You got ${formatINR(rental.bond - rental.bondWithheld)} back. If you disagree with the deduction, raise it with the owner directly.`
                : `${other.name} got ${formatINR(rental.bond - rental.bondWithheld)} back`}
            </p>
          </div>
        ) : (
          <p className="flex items-center gap-2.5 rounded-2xl bg-brand-soft p-4 text-[15px] font-semibold text-brand-deep">
            <ShieldCheck className="size-[18px]" aria-hidden="true" />
            Bond of {formatINR(rental.bond)} returned in full
          </p>
        )
      ) : null}

      <Card className="flex flex-col gap-3 p-4">
        <Row label="Duration">{plural(rental.days, "day")}</Row>
        {rental.startedAt ? <Row label="Handed over">{formatDateTime(rental.startedAt)}</Row> : null}
        {rental.dueAt && rental.status === "active" ? <Row label="Due back">{formatDateTime(rental.dueAt)}</Row> : null}
        {rental.returnedAt ? <Row label="Returned">{formatDateTime(rental.returnedAt)}</Row> : null}
        <Row label="Rent">{formatINR(rent)}</Row>
        <Row label={rental.bondStatus === "held" ? "Bond held by owner" : "Refundable bond"}>{formatINR(rental.bond)}</Row>
        {rental.status === "requested" || rental.status === "approved" ? (
          <div className="border-t border-line pt-3">
            <Row label={role === "owner" ? "Collect at handover" : "Hand over at pickup"} strong>
              {formatINR(rent + rental.bond)}
            </Row>
          </div>
        ) : null}
      </Card>

      {other.phone ? (
        <a href={`tel:+91${other.phone}`} className={buttonClass({ variant: "outline", size: "lg" })}>
          <Phone aria-hidden="true" />
          Call {other.name}
        </a>
      ) : null}

      {role === "owner" && rental.status === "requested" ? (
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" size="lg" disabled={pending} onClick={() => run(() => respondToLoan(rental.id, false))}>
            Decline
          </Button>
          <Button size="lg" pending={pending} onClick={() => run(() => respondToLoan(rental.id, true))}>
            Approve
          </Button>
        </div>
      ) : null}

      {role === "owner" && rental.status === "approved" ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            run(() => confirmHandover(rental.id, code))
          }}
        >
          <Field label="Borrower's handover code" htmlFor="handover-code" hint="Only enter it once you have the rent and bond in hand.">
            <Input
              id="handover-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              placeholder="0000"
              className="tabular text-center font-display text-2xl font-semibold tracking-[0.3em]"
            />
          </Field>
          <Button type="submit" size="lg" pending={pending} disabled={code.length !== 4}>
            Confirm handover
          </Button>
        </form>
      ) : null}

      {role === "owner" && (rental.status === "active" || rental.status === "returned") ? (
        <Button size="lg" variant={rental.status === "returned" ? "primary" : "outline"} onClick={() => setSettling(true)}>
          {rental.status === "returned" ? "Check in and settle bond" : "It's back early — settle bond"}
        </Button>
      ) : null}

      {role === "renter" && rental.status === "active" ? (
        <Button size="lg" pending={pending} onClick={() => run(() => markLoanReturned(rental.id))}>
          I&apos;ve returned it
        </Button>
      ) : null}

      {role === "renter" && (rental.status === "requested" || rental.status === "approved") ? (
        <Button
          variant="ghost"
          className="self-center text-danger hover:bg-danger-soft hover:text-danger"
          pending={pending}
          onClick={() => run(() => cancelLoan(rental.id))}
        >
          Cancel request
        </Button>
      ) : null}

      {["closed", "declined", "cancelled"].includes(rental.status) ? (
        <Link href="/neighbours" className={buttonClass({ variant: "outline", size: "lg" })}>
          Browse more from neighbours
        </Link>
      ) : null}

      <SettleSheet open={settling} onOpenChange={setSettling} loan={loan} />
    </main>
  )
}

function SettleSheet({ open, onOpenChange, loan }: { open: boolean; onOpenChange: (open: boolean) => void; loan: Loan }) {
  const { rental, other } = loan
  const [outcome, setOutcome] = useState<"fine" | "damaged">("fine")
  const [state, action] = useActionState(async (previous: FormState, formData: FormData) => {
    const next = await settleLoan(previous, formData)
    if (next.ok) onOpenChange(false)
    return next
  }, {})
  const errors = state.fieldErrors ?? {}

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Settle the bond"
      description={`You're holding a ${formatINR(rental.bond)} bond from ${other.name}`}
    >
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="loanId" value={rental.id} />
        <Segmented
          label="Condition on return"
          value={outcome}
          onChange={setOutcome}
          options={[
            { value: "fine", label: "Came back fine" },
            { value: "damaged", label: "Something's damaged" },
          ]}
        />
        {outcome === "damaged" && rental.bond > 0 ? (
          <div className="flex animate-rise flex-col gap-4">
            <Field label="Amount to keep" htmlFor="withheld" error={errors.withheld} hint={`Up to ${formatINR(rental.bond)}. Keep only what the repair costs.`}>
              <Input id="withheld" name="withheld" required inputMode="numeric" pattern="[0-9]*" prefix="₹" invalid={Boolean(errors.withheld)} />
            </Field>
            <Field label="What's damaged?" htmlFor="claimNote" error={errors.claimNote} hint={`${other.name} will see this.`}>
              <Textarea id="claimNote" name="claimNote" required maxLength={400} invalid={Boolean(errors.claimNote)} placeholder="Left controller's trigger is cracked; replacement costs ₹1,200." className="min-h-20" />
            </Field>
          </div>
        ) : (
          <>
            <input type="hidden" name="withheld" value="" />
            <input type="hidden" name="claimNote" value="" />
            <p className="text-sm text-ink-soft">
              {outcome === "damaged"
                ? "This loan had no bond, so there's nothing to deduct. Sort it out with the borrower directly."
                : `Hand ${formatINR(rental.bond)} back to ${other.name}, then confirm here.`}
            </p>
          </>
        )}
        <FormError message={state.error} />
        <SubmitButton size="lg" variant={outcome === "damaged" && rental.bond > 0 ? "danger" : "primary"}>
          {outcome === "damaged" && rental.bond > 0 ? "Keep this amount and close" : "Bond returned — close loan"}
        </SubmitButton>
      </form>
    </Sheet>
  )
}
