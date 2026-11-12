import { Check } from "lucide-react"
import type { BookingStatus, RentalStatus } from "@/lib/db/schema"
import { Pill } from "@/components/ui/misc"
import { cn } from "@/lib/utils"

const bookingLabels: Record<BookingStatus, { label: string; tone: "neutral" | "brand" | "marigold" | "danger" | "solid" }> = {
  broadcasting: { label: "Finding shops", tone: "marigold" },
  accepted: { label: "Confirmed", tone: "brand" },
  on_the_way: { label: "On the way", tone: "solid" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
  expired: { label: "No shop found", tone: "neutral" },
}

export function BookingStatusPill({ status }: { status: BookingStatus }) {
  const { label, tone } = bookingLabels[status]
  return <Pill tone={tone}>{label}</Pill>
}

const rentalLabels: Record<RentalStatus, { label: string; tone: "neutral" | "brand" | "marigold" | "danger" }> = {
  reserved: { label: "Ready for pickup", tone: "marigold" },
  active: { label: "With you", tone: "brand" },
  returned: { label: "Returned", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
}

export function RentalStatusPill({ status }: { status: RentalStatus }) {
  const { label, tone } = rentalLabels[status]
  return <Pill tone={tone}>{label}</Pill>
}

export type TimelineStep = { label: string; detail?: string; state: "done" | "active" | "upcoming" }

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol>
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        return (
          <li key={step.label} className="flex gap-3.5" aria-current={step.state === "active" ? "step" : undefined}>
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "relative flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300",
                  step.state === "done" && "border-brand bg-brand text-on-brand",
                  step.state === "active" && "border-brand bg-surface",
                  step.state === "upcoming" && "border-line-strong bg-surface",
                )}
              >
                {step.state === "done" ? <Check className="size-3.5 animate-pop" strokeWidth={3} aria-hidden="true" /> : null}
                {step.state === "active" ? (
                  <>
                    <span className="absolute size-full animate-ping rounded-full bg-brand/25" />
                    <span className="size-2 rounded-full bg-brand" />
                  </>
                ) : null}
              </span>
              {!last ? (
                <span
                  className={cn(
                    "my-1 min-h-5 w-0.5 flex-1 rounded-full transition-colors duration-300",
                    step.state === "done" ? "bg-brand" : "bg-line",
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-5", last && "pb-0")}>
              <p
                className={cn(
                  "text-[15px] font-semibold leading-6",
                  step.state === "upcoming" ? "text-ink-faint" : "text-ink",
                )}
              >
                {step.label}
              </p>
              {step.detail ? <p className="text-[13px] text-ink-soft">{step.detail}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
