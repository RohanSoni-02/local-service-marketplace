import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({
  rating,
  size = "sm",
  showValue = true,
  className,
}: {
  rating: number
  size?: "sm" | "md"
  showValue?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star
        className={cn(size === "sm" ? "size-3.5" : "size-4", "fill-accent text-accent")}
        aria-hidden="true"
      />
      {showValue ? (
        <span className={cn(size === "sm" ? "text-xs" : "text-sm", "font-semibold text-foreground")}>
          {rating.toFixed(1)}
        </span>
      ) : null}
    </div>
  )
}
