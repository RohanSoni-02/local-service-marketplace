import { BadgeCheck, ShieldCheck } from "lucide-react"
import type { Shop } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function VerifiedBadge({
  tier,
  className,
  compact,
}: {
  tier: Shop["tier"]
  className?: string
  compact?: boolean
}) {
  if (tier === "New") return null

  const isGold = tier === "Gold Verified"
  const Icon = isGold ? ShieldCheck : BadgeCheck

  if (compact) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", isGold ? "text-primary" : "text-primary/70", className)}>
        <Icon className="size-3.5" aria-hidden="true" />
        <span className="sr-only">{tier}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        isGold ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {tier}
    </span>
  )
}
