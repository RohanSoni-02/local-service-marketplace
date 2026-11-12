import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react"
import { getCategory } from "@/lib/catalog"
import { formatDistance, formatINR, timeAgo } from "@/lib/format"
import { getShop, listReviews, listTools } from "@/lib/server/shops"
import { ShopPhoto } from "@/components/shop-photo"
import { TierBadge } from "@/components/tier-badge"
import { ToolRow } from "@/components/tool-row"
import { buttonClass } from "@/components/ui/button-class"
import { Rating, SectionTitle } from "@/components/ui/misc"
import { ActionBar, BackButton } from "@/components/ui/top-bar"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shop = await getShop((await params).id)
  return shop ? { title: shop.name, description: shop.bio } : { title: "Shop not found" }
}

export default async function ShopPage({ params }: Props) {
  const { id } = await params
  const shop = await getShop(id)
  if (!shop) notFound()
  const [tools, reviews] = await Promise.all([listTools(id), listReviews(id)])
  const category = getCategory(shop.categoryId)

  const stats = [
    { label: "Rating", value: shop.rating.toFixed(1), detail: `${shop.ratingCount} reviews` },
    { label: "Jobs done", value: shop.jobsCompleted.toLocaleString("en-IN"), detail: "on Thikana" },
    { label: "Distance", value: formatDistance(shop.distanceKm), detail: `serves ${shop.serviceRadiusKm} km` },
  ]

  return (
    <>
      <main className="pb-28">
        <div className="relative">
          <ShopPhoto shop={shop} sizes="(min-width: 480px) 480px, 100vw" priority className="aspect-[16/11]" />
          <BackButton
            fallback={`/category/${shop.categoryId}`}
            className="absolute left-4 top-4 ml-0 bg-surface shadow-float hover:bg-surface"
          />
        </div>

        <div className="relative -mt-5 flex flex-col gap-7 rounded-t-[28px] bg-background px-4 pt-6">
          <div className="animate-rise">
            <TierBadge tier={shop.tier} />
            <h1 className="mt-2.5 text-[26px] font-bold leading-tight text-ink">{shop.name}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {category?.name} · {shop.area}
            </p>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-surface py-3.5">
            {stats.map((stat) => (
              <div key={stat.label} className="px-3 text-center">
                <dt className="text-xs text-ink-soft">{stat.label}</dt>
                <dd className="tabular mt-0.5 font-display text-xl font-semibold text-ink">{stat.value}</dd>
                <dd className="text-xs text-ink-soft">{stat.detail}</dd>
              </div>
            ))}
          </dl>

          <section className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-ink">{shop.bio}</p>
            <ul className="flex flex-col gap-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-brand" aria-hidden="true" />
                {shop.hours}
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-brand" aria-hidden="true" />
                {shop.area} · {shop.pincode}
              </li>
            </ul>
            <div className="mt-1 grid grid-cols-2 gap-2.5">
              <Link href={`/chat/${shop.id}`} className={buttonClass({ variant: "outline" })}>
                <MessageCircle aria-hidden="true" />
                Message
              </Link>
              <a href={`tel:+91${shop.phone}`} className={buttonClass({ variant: "outline" })}>
                <Phone aria-hidden="true" />
                Call shop
              </a>
            </div>
          </section>

          {shop.gallery.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionTitle>Photos</SectionTitle>
              <div className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4">
                {shop.gallery.map((src, index) => (
                  <div key={src} className="relative aspect-[4/3] w-56 shrink-0 snap-start overflow-hidden rounded-2xl bg-sunken">
                    <Image src={src} alt={`${shop.name}, photo ${index + 1}`} fill sizes="224px" className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {tools.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionTitle>Tools for rent</SectionTitle>
              <ul className="flex flex-col gap-2.5">
                {tools.map((tool) => (
                  <li key={tool.id}>
                    <ToolRow tool={tool} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="flex flex-col gap-1">
            <SectionTitle action={<Rating value={shop.rating} count={shop.ratingCount} />}>Reviews</SectionTitle>
            {reviews.length === 0 ? (
              <p className="py-3 text-sm text-ink-soft">No written reviews yet. Be the first after your visit.</p>
            ) : (
              <ul className="divide-y divide-line">
                {reviews.map((review) => (
                  <li key={review.id} className="py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">{review.author}</span>
                      <span className="text-xs text-ink-soft">{timeAgo(review.createdAt)}</span>
                    </div>
                    <Rating value={review.rating} className="mt-0.5" />
                    {review.text ? <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{review.text}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <ActionBar className="flex items-center gap-4">
        <div className="leading-tight">
          <p className="text-xs text-ink-soft">Home visit from</p>
          <p className="tabular font-display text-xl font-semibold text-ink">{formatINR(shop.visitFee)}</p>
        </div>
        <Link href={`/shop/${shop.id}/book`} className={buttonClass({ size: "lg", className: "flex-1" })}>
          Request a visit
        </Link>
      </ActionBar>
    </>
  )
}
