import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategory, serviceArea } from "@/lib/catalog"
import { plural } from "@/lib/format"
import { listShops } from "@/lib/server/shops"
import { CategoryIcon } from "@/components/category-icon"
import { ShopExplorer } from "@/components/shop-explorer"
import { TopBar } from "@/components/ui/top-bar"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).id)
  return { title: category ? `${category.name} near ${serviceArea.name}` : "Not found" }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  const category = getCategory(id)
  if (!category) notFound()
  const shops = await listShops({ categoryId: id, sort: "rating" })

  return (
    <>
      <TopBar
        title={category.name}
        subtitle={`${plural(shops.length, "shop")} near ${serviceArea.name}`}
        fallback="/"
      />
      <main className="py-5">
        {shops.length === 0 ? (
          <div className="flex flex-col items-center px-8 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <CategoryIcon categoryId={id} className="size-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">No shops here yet</h2>
            <p className="mt-1 text-sm text-ink-soft">We&apos;re onboarding {category.name.toLowerCase()} shops in your area.</p>
          </div>
        ) : (
          <ShopExplorer title="Top rated first" shops={shops} layout="list" />
        )}
      </main>
    </>
  )
}
