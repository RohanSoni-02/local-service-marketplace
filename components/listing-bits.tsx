import Image from "next/image"
import Link from "next/link"
import { Armchair, Bike, Gamepad2, Package, PartyPopper, Speaker, Wrench, type LucideProps } from "lucide-react"
import { formatDistance, formatINR } from "@/lib/format"
import type { ListingView } from "@/lib/server/listings"
import { Pill } from "@/components/ui/misc"
import { cn } from "@/lib/utils"

const icons: Record<string, React.ComponentType<LucideProps>> = {
  gaming: Gamepad2,
  party: PartyPopper,
  electronics: Speaker,
  furniture: Armchair,
  tools: Wrench,
  sports: Bike,
  other: Package,
}

export function ListingIcon({ category, ...props }: { category: string } & LucideProps) {
  const Icon = icons[category] ?? Package
  return <Icon aria-hidden="true" strokeWidth={1.6} {...props} />
}

export function ListingPhoto({
  listing,
  sizes,
  priority,
  className,
}: {
  listing: { photo: string | null; category: string }
  sizes: string
  priority?: boolean
  className?: string
}) {
  // Uploaded photos are already small JPEGs served from the database; skip the optimiser for those.
  const uploaded = listing.photo?.startsWith("/listing-photo/")
  return (
    <div className={cn("relative shrink-0 overflow-hidden bg-marigold-soft", className)}>
      {listing.photo ? (
        <Image
          src={listing.photo}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={uploaded}
          className={uploaded ? "object-cover" : "bg-white object-contain p-2"}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-marigold-ink/70">
          <ListingIcon category={listing.category} className="size-[36%] max-h-14 max-w-14" />
        </div>
      )}
    </div>
  )
}

export function ListingCard({ listing, priority, className }: { listing: ListingView; priority?: boolean; className?: string }) {
  return (
    <Link
      href={`/neighbours/${listing.id}`}
      className={cn("pressable block overflow-hidden rounded-2xl border border-line bg-surface hover:border-line-strong", className)}
    >
      <div className="relative">
        <ListingPhoto listing={listing} sizes="240px" priority={priority} className="aspect-[4/3]" />
        {!listing.available ? <Pill className="absolute left-2 top-2 bg-surface shadow-card">Lent out</Pill> : null}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2.5em] font-sans text-sm font-semibold leading-tight tracking-normal text-ink">
          {listing.title}
        </h3>
        <p className="mt-1.5 text-[13px] text-ink-soft">
          <span className="tabular text-[15px] font-semibold text-ink">{formatINR(listing.dailyPrice)}</span> / day
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-soft">
          {listing.ownerName} · {formatDistance(listing.distanceKm)}
        </p>
      </div>
    </Link>
  )
}

/** Compact horizontal row, used under the map and in lists. */
export function ListingRow({ listing }: { listing: ListingView }) {
  return (
    <Link
      href={`/neighbours/${listing.id}`}
      className="pressable flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3 hover:border-line-strong"
    >
      <ListingPhoto listing={listing} sizes="72px" className="size-[72px] rounded-xl" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-sans text-[15px] font-semibold tracking-normal text-ink">{listing.title}</h3>
        <p className="truncate text-[13px] text-ink-soft">
          {listing.ownerName} · {formatDistance(listing.distanceKm)}
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          <span className="tabular text-[15px] font-semibold text-ink">{formatINR(listing.dailyPrice)}</span> / day ·{" "}
          {formatINR(listing.bond)} bond
        </p>
      </div>
      {!listing.available ? <Pill>Lent out</Pill> : null}
    </Link>
  )
}
