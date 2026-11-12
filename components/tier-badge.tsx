import { BadgeCheck, ShieldCheck, Sparkles } from "lucide-react"
import { Pill } from "@/components/ui/misc"

type Tier = "Gold Verified" | "Verified" | "New"

export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  if (tier === "Gold Verified") {
    return (
      <Pill tone="marigold" icon={ShieldCheck} className={className}>
        Gold verified
      </Pill>
    )
  }
  if (tier === "Verified") {
    return (
      <Pill tone="brand" icon={BadgeCheck} className={className}>
        Verified
      </Pill>
    )
  }
  return (
    <Pill icon={Sparkles} className={className}>
      New
    </Pill>
  )
}
