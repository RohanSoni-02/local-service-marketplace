import Link from "next/link"
import Image from "next/image"
import { Briefcase, MapPin } from "lucide-react"
import type { Shop } from "@/lib/mock-data"
import { StarRating } from "@/components/star-rating"
import { VerifiedBadge } from "@/components/verified-badge"
import { cn } from "@/lib/utils"

export function ShopCard({
  shop,
  variant = "list",
  className,
  priority = false,
}: {
  shop: Shop
  variant?: "list" | "carousel"
  className?: string
  priority?: boolean
}) {
  return (
    <Link
      href={`/shop/${shop.id}`}
      className={cn(
        "block overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border active:opacity-90",
        variant === "carousel" ? "w-[220px] shrink-0" : "w-full",
        className,
      )}
    >
      <div className={cn("relative w-full bg-muted", variant === "carousel" ? "h-28" : "h-32")}>
        <Image
          src={shop.photo || "/placeholder.svg"}
          alt={shop.name}
          fill
          sizes="220px"
          className="object-cover"
          priority={priority}
        />
        <VerifiedBadge tier={shop.tier} className="absolute left-2 top-2 shadow-sm" />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="truncate font-heading text-[14px] font-semibold leading-snug text-foreground">
          {shop.name}
        </h3>
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <StarRating rating={shop.rating} />
          <span className="flex items-center gap-1 text-xs">
            <Briefcase className="size-3" aria-hidden="true" />
            {shop.jobsCompleted}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <MapPin className="size-3" aria-hidden="true" />
            {shop.distanceKm} km
          </span>
        </div>
      </div>
    </Link>
  )
}
