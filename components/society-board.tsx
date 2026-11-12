"use client"

import { useActionState, useState } from "react"
import { CalendarDays, Check, Plus, Users } from "lucide-react"
import { createGroupRequest, leaveSociety, selectGroupOffer, setGroupParticipation } from "@/lib/actions/society"
import type { FormState } from "@/lib/actions/types"
import { societyServiceCategories } from "@/lib/catalog"
import type { Society } from "@/lib/db/schema"
import { formatINR, formatISODate, plural } from "@/lib/format"
import type { SocietyBoard } from "@/lib/server/society"
import { useAction } from "@/components/use-action"
import { Button, Spinner, SubmitButton } from "@/components/ui/button"
import { Field, FormError, Input, Textarea } from "@/components/ui/field"
import { Card, EmptyState, Pill } from "@/components/ui/misc"
import { Sheet } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type Member = { flat: string; role: "admin" | "resident" }

export function SocietyBoardView({
  society,
  member,
  board,
  today,
}: {
  society: Society
  member: Member
  board: SocietyBoard
  today: string
}) {
  const isAdmin = member.role === "admin"
  const [composing, setComposing] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [state, action] = useActionState(async (previous: FormState, formData: FormData) => {
    const next = await createGroupRequest(previous, formData)
    if (next.ok) setComposing(false)
    return next
  }, {})
  const [pending, run] = useAction()
  const errors = state.fieldErrors ?? {}

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <header className="animate-rise rounded-3xl bg-brand-deep p-5 text-on-brand">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-marigold">Your society</p>
          <span className="rounded-full bg-on-brand/12 px-2.5 py-1 text-xs font-semibold">
            {isAdmin ? "Admin" : "Resident"} · Flat {member.flat}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold leading-tight">{society.name}</h1>
        <p className="mt-1 text-sm text-on-brand/75">
          {society.address} · {society.pincode}
        </p>
        <p className="mt-4 flex items-center gap-2 text-sm text-on-brand/85">
          <Users className="size-4" aria-hidden="true" />
          {plural(board.memberCount, "flat")} on Thikana
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-semibold">Group requests</h2>
          {isAdmin ? (
            <Button size="sm" onClick={() => setComposing(true)}>
              <Plus aria-hidden="true" />
              New request
            </Button>
          ) : null}
        </div>

        {board.requests.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No group requests yet"
            body={
              isAdmin
                ? "Post the first one — pest control and tank cleaning are popular starters."
                : "Your society admin can post a request for everyone to join."
            }
          />
        ) : (
          <ul className="stagger flex flex-col gap-3">
            {board.requests.map((entry) => (
              <li key={entry.request.id}>
                <RequestCard entry={entry} isAdmin={isAdmin} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button variant="ghost" size="sm" className="self-center text-ink-soft" onClick={() => setLeaving(true)}>
        Leave this society
      </Button>

      <Sheet
        open={composing}
        onOpenChange={setComposing}
        title="New group request"
        description="Residents join in, then providers quote a per-flat rate."
      >
        <form action={action} className="flex flex-col gap-4">
          <Field label="Service" htmlFor="req-category">
            <select
              id="req-category"
              name="category"
              className="h-12 w-full rounded-xl border border-line-strong bg-surface px-3 text-[15px] focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12"
            >
              {societyServiceCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Field label="What's needed" htmlFor="req-description" error={errors.description}>
            <Textarea
              id="req-description"
              name="description"
              required
              maxLength={400}
              invalid={Boolean(errors.description)}
              placeholder="Quarterly pest control for all flats, including stairwells."
              className="min-h-24"
            />
          </Field>
          <Field label="Preferred date" htmlFor="req-date" error={errors.preferredDate}>
            <Input id="req-date" name="preferredDate" type="date" required min={today} invalid={Boolean(errors.preferredDate)} />
          </Field>
          <FormError message={state.error} />
          <SubmitButton size="lg">Post to society</SubmitButton>
        </form>
      </Sheet>

      <Sheet
        open={leaving}
        onOpenChange={setLeaving}
        title={`Leave ${society.name}?`}
        description="You'll be removed from its group requests. You can rejoin any time."
      >
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" size="lg" onClick={() => setLeaving(false)}>
            Stay
          </Button>
          <Button variant="danger" size="lg" pending={pending} onClick={() => run(leaveSociety)}>
            Leave
          </Button>
        </div>
      </Sheet>
    </div>
  )
}

function RequestCard({ entry, isAdmin }: { entry: SocietyBoard["requests"][number]; isAdmin: boolean }) {
  const { request, offers, selectedOffer, flatsJoined, joined } = entry
  const [pending, run] = useAction()
  const open = request.status === "open"

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-tight">{request.category}</h3>
        <Pill tone={open ? "brand" : "neutral"}>{open ? "Open" : request.status === "closed" ? "Confirmed" : "Done"}</Pill>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{request.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-brand" aria-hidden="true" />
          {formatISODate(request.preferredDate)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-3.5 text-brand" aria-hidden="true" />
          {plural(flatsJoined, "flat")} joined
        </span>
      </div>

      {selectedOffer ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-brand-soft px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-brand-deep/80">Confirmed provider</p>
            <p className="truncate text-[15px] font-semibold text-brand-deep">{selectedOffer.shopName}</p>
          </div>
          <p className="tabular shrink-0 text-right font-display text-lg font-semibold text-brand-deep">
            {formatINR(selectedOffer.pricePerFlat)}
            <span className="font-sans text-xs font-normal"> / flat</span>
          </p>
        </div>
      ) : null}

      {open ? (
        <div className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
          <p className="text-[13px] font-semibold text-ink">Provider quotes</p>
          {offers.length === 0 ? (
            <p className="flex items-center gap-2.5 text-sm text-ink-soft">
              <Spinner className="text-brand" />
              Waiting for providers to quote
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {offers.map((offer) => {
                const short = Math.max(0, offer.minFlats - flatsJoined)
                return (
                  <li key={offer.id} className="animate-rise rounded-xl border border-line px-3.5 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 truncate text-[15px] font-semibold text-ink">{offer.shopName}</p>
                      <p className="tabular shrink-0 font-display text-lg font-semibold text-ink">
                        {formatINR(offer.pricePerFlat)}
                        <span className="font-sans text-xs font-normal text-ink-soft"> / flat</span>
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className={cn("text-[13px]", short > 0 ? "text-marigold-ink" : "text-brand")}>
                        {short > 0
                          ? `Needs ${plural(short, "more flat")} to reach ${offer.minFlats}`
                          : `Minimum of ${offer.minFlats} flats met`}
                      </p>
                      {isAdmin && short === 0 ? (
                        <Button size="sm" disabled={pending} onClick={() => run(() => selectGroupOffer(request.id, offer.id))}>
                          Confirm
                        </Button>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <Button
            variant={joined ? "secondary" : "primary"}
            className="mt-1.5"
            pending={pending}
            onClick={() => run(() => setGroupParticipation(request.id, !joined))}
          >
            {joined ? (
              <>
                <Check aria-hidden="true" />
                Your flat is in · tap to leave
              </>
            ) : (
              "Add my flat"
            )}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
