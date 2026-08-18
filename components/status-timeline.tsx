import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type TimelineStepState = "done" | "active" | "upcoming"

export function StatusTimeline({
  steps,
}: {
  steps: { label: string; description?: string; state: TimelineStepState }[]
}) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <li key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                  step.state === "done" && "border-primary bg-primary text-primary-foreground",
                  step.state === "active" && "border-primary bg-card text-primary",
                  step.state === "upcoming" && "border-border bg-card text-muted-foreground",
                )}
              >
                {step.state === "done" ? (
                  <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      step.state === "active" ? "bg-primary animate-pulse" : "bg-border",
                    )}
                  />
                )}
              </span>
              {!isLast && (
                <span
                  className={cn("mt-0.5 w-0.5 flex-1 min-h-6", step.state === "done" ? "bg-primary" : "bg-border")}
                />
              )}
            </div>
            <div className={cn("flex flex-col pb-5", isLast && "pb-0")}>
              <span
                className={cn(
                  "text-[13.5px] font-semibold",
                  step.state === "upcoming" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {step.label}
              </span>
              {step.description && <span className="text-[12px] text-muted-foreground">{step.description}</span>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
