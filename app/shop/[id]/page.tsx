import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, MapPinned, ChevronRight } from "lucide-react"
import { getShop, getToolsByShop } from "@/lib/mock-data"
import { StarRating } from "@/components/star-rating"
import { VerifiedBadge } from "@/components/verified-badge"
import { ReviewItem } from "@/components/review-item"
import { ToolCard } from "@/components/tool-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ShopProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shop = getShop(id)
  if (!shop) notFound()

  const shopTools = getToolsByShop(id)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="relative h-48 w-full shrink-0 bg-muted">
          <Image
            src={shop.photo || "/placeholder.svg"}
            alt={shop.name}
            fill
            sizes="430px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10" />
          <Link
            href={`/category/${shop.categoryId}`}
            aria-label="Go back"
            className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm active:opacity-70"
          >
            <ArrowLeft className="size-[18px]" aria-hidden="true" />
          </Link>
          <div className="absolute bottom-3 left-4">
            <VerifiedBadge tier={shop.tier} />
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-[19px] font-bold leading-tight text-foreground">{shop.name}</h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <StarRating rating={shop.rating} />
              <span className="text-[12.5px]">{shop.jobsCompleted} jobs completed</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl bg-secondary p-3.5">
            <div className="flex items-center gap-2.5 text-[12.5px] text-foreground">
              <Clock className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {shop.hours}
            </div>
            <div className="flex items-center gap-2.5 text-[12.5px] text-foreground">
              <MapPinned className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {shop.distanceKm} km away · serves within {shop.serviceRadiusKm} km
            </div>
          </div>

          <p className="text-[13.5px] leading-relaxed text-muted-foreground">{shop.bio}</p>

          <div className="grid grid-cols-2 gap-2">
            {shop.gallery.map((src, i) => (
              <div key={src} className="relative h-24 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={src || "/placeholder.svg"}
                  alt={`${shop.name} photo ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <Tabs defaultValue="book" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="book" className="flex-1">
                Book Service
              </TabsTrigger>
              <TabsTrigger value="rent" className="flex-1">
                Rent Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="book" className="pt-4">
              <div className="flex flex-col gap-3">
                <p className="text-[13px] text-muted-foreground">
                  Describe your issue and we&apos;ll broadcast your request to {shop.name} and nearby shops —
                  whichever accepts first gets the job.
                </p>
                <Link
                  href={`/shop/${shop.id}/book`}
                  className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3.5 font-heading text-[14px] font-semibold text-primary-foreground active:opacity-90"
                >
                  Request a service visit
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="rent" className="pt-4">
              {shopTools.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  This shop doesn&apos;t list tools for rent yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {shopTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} shopId={shop.id} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <h2 className="font-heading text-[15px] font-semibold text-foreground">
              Reviews · {shop.reviews.length}
            </h2>
            <div>
              {shop.reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
