import type { Metadata } from "next"
import Link from "next/link"
import { PackageSearch, Plus, Search } from "lucide-react"
import { getListingCategory, listingCategories } from "@/lib/catalog"
import { searchListings, searchShopTools } from "@/lib/server/listings"
import { ListingExplorer } from "@/components/listing-explorer"
import { buttonClass } from "@/components/ui/button-class"
import { EmptyState } from "@/components/ui/misc"
import { ActionBar, BackButton } from "@/components/ui/top-bar"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Borrow from neighbours" }

type Props = { searchParams: Promise<{ q?: string; category?: string }> }

export default async function NeighboursPage({ searchParams }: Props) {
  const params = await searchParams
  const query = (params.q ?? "").trim().slice(0, 60)
  const category = getListingCategory(params.category ?? "")?.id
  const [listings, shopTools] = await Promise.all([
    searchListings({ query, category }),
    category ? [] : searchShopTools(query),
  ])
  const href = (next: string | undefined) => {
    const search = new URLSearchParams()
    if (query) search.set("q", query)
    if (next) search.set("category", next)
    const qs = search.toString()
    return qs ? `/neighbours?${qs}` : "/neighbours"
  }
  const chip =
    "pressable flex h-9 shrink-0 items-center rounded-full border border-line-strong bg-surface px-3.5 text-[13.5px] font-medium text-ink aria-[current=true]:border-brand aria-[current=true]:bg-brand aria-[current=true]:text-on-brand"

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-background">
        <div className="flex h-16 items-center gap-2 px-4">
          <BackButton fallback="/" />
          <form action="/neighbours" role="search" className="relative flex-1">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <label htmlFor="neighbour-search" className="sr-only">
              Search things to borrow nearby
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
            <input
              id="neighbour-search"
              name="q"
              type="search"
              defaultValue={query}
              enterKeyHint="search"
              placeholder="PS5, bean bag, speaker, ladder…"
              className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-3 text-[15px] placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12"
            />
          </form>
        </div>
        <nav aria-label="Categories" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          <Link href={href(undefined)} aria-current={!category ? "true" : undefined} className={chip}>
            Everything
          </Link>
          {listingCategories.map((item) => (
            <Link key={item.id} href={href(item.id)} aria-current={category === item.id ? "true" : undefined} className={chip}>
              {item.name}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex flex-col gap-5 px-4 pb-32 pt-5">
        {!query && !category ? (
          <div className="animate-rise">
            <h1 className="text-[26px] font-bold leading-[1.1]">Borrow it from next door</h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Things your neighbours lend by the day. A refundable bond covers the owner if anything breaks.
            </p>
          </div>
        ) : null}

        {listings.length + shopTools.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={query ? `Nobody nearby lists “${query}” yet` : "Nothing listed here yet"}
            body="Try a broader word, or be the first to list one."
          />
        ) : (
          <ListingExplorer key={`${query}|${category}`} listings={listings} shopTools={shopTools} />
        )}
      </main>

      <ActionBar>
        <Link href="/neighbours/new" className={cn(buttonClass({ size: "lg" }), "w-full")}>
          <Plus aria-hidden="true" />
          Lend something of yours
        </Link>
      </ActionBar>
    </>
  )
}
