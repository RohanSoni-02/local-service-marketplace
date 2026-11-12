import Link from "next/link"
import { getCategory } from "@/lib/catalog"
import { formatDistance, formatINR } from "@/lib/format"
import type { ShopListing } from "@/lib/server/shops"
import { ShopPhoto } from "@/components/shop-photo"
import { TierBadge } from "@/components/tier-badge"
import { Rating } from "@/components/ui/misc"

/** Tall photo card for horizontal carousels. */
export function ShopCard({ shop, priority }: { shop: ShopListing; priority?: boolean }) {
  return (
    <Link
      href={`/shop/${shop.id}`}
      className="pressable group w-[15.5rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface"
    >
      <div className="relative">
        <ShopPhoto shop={shop} sizes="248px" priority={priority} className="aspect-[4/3]" />
        <TierBadge tier={shop.tier} className="absolute left-2.5 top-2.5 shadow-card" />
      </div>
      <div className="p-3.5">
        <h3 className="truncate text-base font-semibold text-ink">{shop.name}</h3>
        <p className="mt-0.5 text-[13px] text-ink-soft">{getCategory(shop.categoryId)?.name}</p>
        <div className="mt-2.5 flex items-center justify-between">
          <Rating value={shop.rating} count={shop.ratingCount} />
          <span className="text-[13px] text-ink-soft">{formatDistance(shop.distanceKm)}</span>
        </div>
      </div>
    </Link>
  )
}

/** Compact row for vertical lists. */
export function ShopRow({ shop, priority }: { shop: ShopListing; priority?: boolean }) {
  return (
    <Link
      href={`/shop/${shop.id}`}
      className="pressable flex gap-3.5 rounded-2xl border border-line bg-surface p-3 hover:border-line-strong"
    >
      <ShopPhoto shop={shop} sizes="88px" priority={priority} className="size-[88px] shrink-0 rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <h3 className="truncate text-base font-semibold text-ink">{shop.name}</h3>
        <div className="flex items-center gap-2 text-[13px] text-ink-soft">
          <Rating value={shop.rating} count={shop.ratingCount} />
          <span aria-hidden="true">·</span>
          <span>{formatDistance(shop.distanceKm)}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <TierBadge tier={shop.tier} />
          <span className="text-[13px] text-ink-soft">
            from <span className="tabular font-semibold text-ink">{formatINR(shop.visitFee)}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
