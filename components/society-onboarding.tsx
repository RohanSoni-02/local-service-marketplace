"use client"

import { useActionState, useState } from "react"
import { Building2, ChevronRight, Plus, Search } from "lucide-react"
import { joinSociety, registerSociety } from "@/lib/actions/society"
import type { Society } from "@/lib/db/schema"
import { Button, SubmitButton } from "@/components/ui/button"
import { Field, FormError, Input } from "@/components/ui/field"
import { Sheet } from "@/components/ui/sheet"

export function SocietyOnboarding({ query, societies }: { query: string; societies: Society[] }) {
  const [joining, setJoining] = useState<Society | null>(null)
  const [registering, setRegistering] = useState(false)
  // On success the page re-renders into the society board, so there is nothing to close.
  const [joinState, joinAction] = useActionState(joinSociety, {})
  const [registerState, registerAction] = useActionState(registerSociety, {})
  const registerErrors = registerState.fieldErrors ?? {}

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <header className="animate-rise">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Building2 className="size-6" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-[28px] font-bold leading-[1.1]">Book together, pay less</h1>
        <p className="mt-2 max-w-[36ch] text-[15px] text-ink-soft">
          Link your flat to your society. Neighbours pool into one request for pest control, tank cleaning and more,
          and providers quote a per-flat group rate.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <form action="/society" role="search" className="relative">
          <label htmlFor="society-search" className="sr-only">
            Search societies by name or pincode
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            id="society-search"
            name="q"
            type="search"
            defaultValue={query}
            enterKeyHint="search"
            placeholder="Search by society name or pincode"
            className="h-12 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-3 text-[15px] placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12"
          />
        </form>

        {societies.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-soft">
            No society matches “{query}”. Register it below — it takes a minute.
          </p>
        ) : (
          <ul className="stagger overflow-hidden rounded-2xl border border-line bg-surface">
            {societies.map((society) => (
              <li key={society.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => setJoining(society)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-sunken active:bg-sunken"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{society.name}</span>
                    <span className="block truncate text-[13px] text-ink-soft">
                      {society.address} · {society.pincode}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button variant="outline" size="lg" onClick={() => setRegistering(true)}>
        <Plus aria-hidden="true" />
        Register a new society
      </Button>

      <Sheet
        open={joining !== null}
        onOpenChange={(open) => !open && setJoining(null)}
        title={`Join ${joining?.name ?? "society"}`}
        description="Your flat number lets neighbours and providers see which homes are in."
      >
        <form action={joinAction} className="flex flex-col gap-4">
          <input type="hidden" name="societyId" value={joining?.id ?? ""} />
          <Field label="Flat number" htmlFor="join-flat" error={joinState.fieldErrors?.flat}>
            <Input id="join-flat" name="flat" required placeholder="B-204" invalid={Boolean(joinState.fieldErrors?.flat)} />
          </Field>
          <FormError message={joinState.error} />
          <SubmitButton size="lg">Join society</SubmitButton>
        </form>
      </Sheet>

      <Sheet
        open={registering}
        onOpenChange={setRegistering}
        title="Register your society"
        description="You'll be its first admin and can post group requests right away."
      >
        <form action={registerAction} className="flex flex-col gap-4">
          <Field label="Society name" htmlFor="soc-name" error={registerErrors.name}>
            <Input id="soc-name" name="name" required placeholder="Green Valley Apartments" invalid={Boolean(registerErrors.name)} />
          </Field>
          <Field label="Street address" htmlFor="soc-address" error={registerErrors.address}>
            <Input id="soc-address" name="address" required invalid={Boolean(registerErrors.address)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pincode" htmlFor="soc-pincode" error={registerErrors.pincode}>
              <Input id="soc-pincode" name="pincode" required inputMode="numeric" maxLength={6} invalid={Boolean(registerErrors.pincode)} />
            </Field>
            <Field label="Your flat" htmlFor="soc-flat" error={registerErrors.flat}>
              <Input id="soc-flat" name="flat" required placeholder="B-204" invalid={Boolean(registerErrors.flat)} />
            </Field>
          </div>
          <FormError message={registerState.error} />
          <SubmitButton size="lg">Register society</SubmitButton>
        </form>
      </Sheet>
    </div>
  )
}
