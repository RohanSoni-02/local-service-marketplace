import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CircleCheck, MapPin, ShieldCheck } from "lucide-react"
import { getListingCategory } from "@/lib/catalog"
import { formatDistance, formatINR } from "@/lib/format"
import { getUser } from "@/lib/server/auth"
import { getListing } from "@/lib/server/listings"
import { ListingActions } from "@/components/listing-actions"
import { ListingPhoto } from "@/components/listing-bits"
import { Avatar, Pill } from "@/components/ui/misc"
import { BackButton } from "@/components/ui/top-bar"

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ listed?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing((await params).id)
  return { title: listing?.title ?? "Listing not found" }
}

export default async function ListingPage({ params, searchParams }: Props) {
  const { id } = await params
  const [listing, user] = await Promise.all([getListing(id), getUser()])
  if (!listing) notFound()
  const isOwner = user?.id === listing.ownerId
  const justListed = isOwner && (await searchParams).listed === "1"

  return (
    <>
      <main className="pb-32">
        <div className="relative">
          <ListingPhoto listing={listing} sizes="(min-width: 480px) 480px, 100vw" priority className="aspect-[4/3]" />
          <BackButton fallback="/neighbours" className="absolute left-4 top-4 ml-0 bg-surface shadow-float hover:bg-surface" />
        </div>

        <div className="relative -mt-5 flex flex-col gap-6 rounded-t-[28px] bg-background px-4 pt-6">
          {justListed ? (
            <p className="flex animate-rise items-center gap-2.5 rounded-xl bg-brand-soft px-3.5 py-3 text-sm font-medium text-brand-deep">
              <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
              Your listing is live. Requests will show up under Activity.
            </p>
          ) : null}

          <div className="animate-rise">
            <div className="flex flex-wrap gap-2">
              <Pill tone="marigold">{getListingCategory(listing.category)?.name ?? "Other"}</Pill>
              <Pill>{listing.condition}</Pill>
              {listing.status === "paused" ? <Pill tone="danger">Paused</Pill> : null}
              {!listing.available ? <Pill>Lent out right now</Pill> : null}
            </div>
            <h1 className="mt-3 text-[26px] font-bold leading-tight">{listing.title}</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{listing.description}</p>
          </div>

          <dl className="grid grid-cols-2 divide-x divide-line rounded-2xl border border-line bg-surface py-3.5">
            <div className="px-4">
              <dt className="text-xs text-ink-soft">Per day</dt>
              <dd className="tabular font-display text-2xl font-semibold">{formatINR(listing.dailyPrice)}</dd>
            </div>
            <div className="px-4">
              <dt className="text-xs text-ink-soft">Refundable bond</dt>
              <dd className="tabular font-display text-2xl font-semibold">{formatINR(listing.bond)}</dd>
            </div>
          </dl>

          <div className="flex items-center gap-3.5">
            <Avatar name={listing.ownerName} className="bg-ink" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-ink">{isOwner ? "You" : listing.ownerName}</p>
              <p className="flex items-center gap-1.5 text-ink-soft">
                <MapPin className="size-3.5 text-brand" aria-hidden="true" />
                {listing.area} · about {formatDistance(listing.distanceKm)} away
              </p>
            </div>
          </div>

          <section className="rounded-2xl bg-brand-soft p-4 text-brand-deep">
            <h2 className="flex items-center gap-2 font-sans text-[15px] font-semibold tracking-normal">
              <ShieldCheck className="size-[18px]" aria-hidden="true" />
              How the bond protects both of you
            </h2>
            <ol className="mt-2.5 flex list-decimal flex-col gap-1.5 pl-5 text-[13.5px] leading-relaxed">
              <li>At pickup you hand the owner {formatINR(listing.bond)} and show your handover code.</li>
              <li>The owner enters the code, which records that they hold your bond.</li>
              <li>Bring it back in the same condition and the full bond is returned.</li>
              <li>If something broke, the owner can keep part of it and must say why. You see the amount and reason.</li>
            </ol>
          </section>
        </div>
      </main>

      <ListingActions
        listing={{
          id: listing.id,
          title: listing.title,
          dailyPrice: listing.dailyPrice,
          bond: listing.bond,
          status: listing.status,
          available: listing.available,
        }}
        viewer={isOwner ? "owner" : user ? "member" : "guest"}
      />
    </>
  )
}
