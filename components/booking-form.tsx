"use client"

import { useActionState, useState } from "react"
import { CalendarClock, Zap } from "lucide-react"
import { createBooking } from "@/lib/actions/bookings"
import { formatINR } from "@/lib/format"
import { SubmitButton } from "@/components/ui/button"
import { Field, FormError, Input, Textarea } from "@/components/ui/field"
import { Segmented } from "@/components/ui/segmented"
import { ActionBar } from "@/components/ui/top-bar"

const chip =
  "pressable flex h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-ink " +
  "has-checked:border-brand has-checked:bg-brand has-checked:text-on-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand"

export function BookingForm({
  shop,
  issueTypes,
  slots,
  defaultAddress,
}: {
  shop: { id: string; name: string; visitFee: number }
  issueTypes: string[]
  slots: { value: string; label: string }[]
  defaultAddress: string
}) {
  const [state, action] = useActionState(createBooking, {})
  const [when, setWhen] = useState<"now" | "later">("now")
  const [negotiate, setNegotiate] = useState(true)
  const errors = state.fieldErrors ?? {}

  return (
    <form action={action} className="flex flex-col gap-7 px-4 pb-32 pt-5">
      <input type="hidden" name="shopId" value={shop.id} />
      <input type="hidden" name="when" value={when} />

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-[13px] font-semibold text-ink">What&apos;s the issue?</legend>
        <div className="flex flex-wrap gap-2">
          {issueTypes.map((type, index) => (
            <label key={type} className={chip}>
              <input type="radio" name="issueType" value={type} defaultChecked={index === 0} className="sr-only" />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Describe the problem"
        htmlFor="description"
        error={errors.description}
        hint="The more specific you are, the more accurate the quotes."
      >
        <Textarea
          id="description"
          name="description"
          required
          maxLength={600}
          invalid={Boolean(errors.description)}
          placeholder="Kitchen tap has been leaking since morning, water pooling under the sink…"
        />
      </Field>

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-semibold text-ink">When do you need it?</span>
        <Segmented
          label="Timing"
          value={when}
          onChange={setWhen}
          options={[
            { value: "now", label: <><Zap aria-hidden="true" /> As soon as possible</> },
            { value: "later", label: <><CalendarClock aria-hidden="true" /> Schedule</> },
          ]}
        />
        {when === "later" ? (
          <div className="flex animate-rise flex-wrap gap-2 pt-1">
            {slots.map((slot, index) => (
              <label key={slot.value} className={chip}>
                <input type="radio" name="slot" value={slot.value} defaultChecked={index === 0} className="sr-only" />
                {slot.label}
              </label>
            ))}
            {errors.slot ? <p className="w-full text-[13px] text-danger">{errors.slot}</p> : null}
          </div>
        ) : null}
      </div>

      <Field label="Visit address" htmlFor="address" error={errors.address}>
        <Input
          id="address"
          name="address"
          required
          autoComplete="street-address"
          defaultValue={defaultAddress}
          invalid={Boolean(errors.address)}
        />
      </Field>

      <Field
        label="Your budget"
        htmlFor="budget"
        optional
        error={errors.budget}
        hint={`${shop.name} charges from ${formatINR(shop.visitFee)} for a visit.`}
      >
        <Input
          id="budget"
          name="budget"
          inputMode="numeric"
          pattern="[0-9]*"
          prefix="₹"
          placeholder="500"
          invalid={Boolean(errors.budget)}
        />
      </Field>

      <label className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-4">
        <span className="flex-1">
          <span className="block text-[15px] font-semibold text-ink">Compare offers</span>
          <span className="mt-0.5 block text-[13px] text-ink-soft">
            {negotiate
              ? "Nearby shops send quotes. You pick one, or counter with your price."
              : "The first shop to accept gets the job at its standard rate."}
          </span>
        </span>
        <span className="relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center">
          <input
            type="checkbox"
            name="allowNegotiation"
            checked={negotiate}
            onChange={(event) => setNegotiate(event.target.checked)}
            className="peer sr-only"
          />
          <span className="absolute inset-0 rounded-full bg-line-strong transition-colors duration-200 ease-out peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand" />
          <span className="relative ml-0.5 size-6 rounded-full bg-surface shadow-card transition-transform duration-200 ease-out-quint peer-checked:translate-x-5" />
        </span>
      </label>

      <FormError message={state.error} />

      <ActionBar>
        <SubmitButton size="lg" className="w-full">
          {negotiate ? "Get offers from nearby shops" : "Send request"}
        </SubmitButton>
        <p className="mt-2 text-center text-xs text-ink-soft">Free to request. You pay the shop only after the job.</p>
      </ActionBar>
    </form>
  )
}
