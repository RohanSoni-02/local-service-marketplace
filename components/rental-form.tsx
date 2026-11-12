"use client"

import { useState } from "react"
import { Minus, Plus, ShieldCheck } from "lucide-react"
import { createRental } from "@/lib/actions/rentals"
import { formatINR, plural } from "@/lib/format"
import type { ToolListing } from "@/lib/server/shops"
import { ToolPhoto } from "@/components/tool-row"
import { useAction } from "@/components/use-action"
import { Button } from "@/components/ui/button"
import { Card, Pill, Row } from "@/components/ui/misc"
import { ActionBar } from "@/components/ui/top-bar"

const MAX_DAYS = 14

export function RentalForm({ tool, shopName }: { tool: ToolListing; shopName: string }) {
  const [days, setDays] = useState(2)
  const [pending, run] = useAction()
  const rent = tool.dailyPrice * days
  const total = rent + tool.deposit

  const stepper =
    "pressable flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface text-ink hover:bg-sunken disabled:opacity-40"

  return (
    <main className="flex flex-col gap-6 px-4 pb-32 pt-5">
      <div className="flex animate-rise flex-col items-center gap-4 text-center">
        <ToolPhoto tool={tool} sizes="200px" className="size-48 rounded-3xl border border-line" />
        <div>
          <h2 className="text-2xl font-semibold leading-tight">{tool.name}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {tool.category} · {tool.condition} condition
          </p>
        </div>
        {!tool.available ? <Pill tone="danger">Currently rented out</Pill> : null}
      </div>

      <Card className="flex items-center justify-between p-4">
        <div>
          <p className="text-[13px] font-semibold text-ink">Rental period</p>
          <p className="text-[13px] text-ink-soft">{formatINR(tool.dailyPrice)} per day</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="One day fewer" disabled={days <= 1} onClick={() => setDays(days - 1)} className={stepper}>
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <output aria-live="polite" className="tabular w-[4.5rem] text-center font-display text-xl font-semibold">
            {plural(days, "day")}
          </output>
          <button type="button" aria-label="One day more" disabled={days >= MAX_DAYS} onClick={() => setDays(days + 1)} className={stepper}>
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <Row label={`${formatINR(tool.dailyPrice)} × ${plural(days, "day")}`}>{formatINR(rent)}</Row>
        <Row label="Refundable deposit">{formatINR(tool.deposit)}</Row>
        <div className="border-t border-line pt-3">
          <Row label="Pay at pickup" strong>
            {formatINR(total)}
          </Row>
        </div>
      </Card>

      <p className="flex gap-3 text-[13px] leading-relaxed text-ink-soft">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
        {shopName} returns your {formatINR(tool.deposit)} deposit in full when the tool comes back in the condition you
        received it.
      </p>

      <ActionBar>
        <Button
          size="lg"
          className="w-full"
          pending={pending}
          disabled={!tool.available}
          onClick={() => run(() => createRental(tool.id, days))}
        >
          {tool.available ? `Reserve · pay ${formatINR(total)} at pickup` : "Not available right now"}
        </Button>
      </ActionBar>
    </main>
  )
}
