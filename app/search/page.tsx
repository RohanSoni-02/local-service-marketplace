import type { Metadata } from "next"
import Link from "next/link"
import { PackageSearch, Search } from "lucide-react"
import { formatDistance, formatINR, plural } from "@/lib/format"
import { searchStock } from "@/lib/server/stock"
import { ReserveButton } from "@/components/reserve-button"
import { Card, EmptyState, Pill } from "@/components/ui/misc"
import { BackButton } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Find a part nearby" }

const suggestions = ["Pipe joint", "MCB", "Screw set", "Teflon tape", "LED batten"]

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = ((await searchParams).q ?? "").trim().slice(0, 60)
  const results = query.length >= 2 ? await searchStock(query) : []

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-background px-4">
        <BackButton fallback="/" />
        <form action="/search" role="search" className="relative flex-1">
          <label htmlFor="search" className="sr-only">
            Search parts in nearby shops
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            id="search"
            name="q"
            type="search"
            defaultValue={query}
            autoFocus={!query}
            enterKeyHint="search"
            placeholder="Pipe joint, MCB, screws…"
            className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-3 text-[15px] placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12"
          />
        </form>
      </header>

      <main className="px-4 pb-10 pt-5">
        {query.length < 2 ? (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-semibold leading-tight">Check stock before you step out</h1>
              <p className="mt-1.5 text-sm text-ink-soft">
                Search hardware and spares in shops around you, then hold one at the counter for two hours.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {suggestions.map((term) => (
                <li key={term}>
                  <Link
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="pressable flex h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-medium hover:bg-sunken"
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={`Nothing for “${query}”`}
            body="No nearby shop lists that yet. Try a shorter or more general term."
          />
        ) : (
          <>
            <p className="text-[13px] text-ink-soft">
              {plural(results.length, "match", "matches")} for “{query}”, in-stock and nearest first
            </p>
            <ul className="stagger mt-3 flex flex-col gap-3">
              {results.map(({ item, shop }) => (
                <li key={item.id}>
                  <Card className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-sans text-[15px] font-semibold tracking-normal text-ink">
                        {item.productName}
                      </h2>
                      <Link href={`/shop/${shop.id}`} className="block truncate text-[13px] text-ink-soft hover:text-ink">
                        {shop.name} · {formatDistance(shop.distanceKm)}
                      </Link>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="tabular font-display text-lg font-semibold text-ink">{formatINR(item.price)}</span>
                        {item.stock === 0 ? (
                          <Pill tone="danger">Out of stock</Pill>
                        ) : item.stock <= 5 ? (
                          <Pill tone="marigold">Only {item.stock} left</Pill>
                        ) : (
                          <Pill tone="brand">In stock</Pill>
                        )}
                      </div>
                    </div>
                    {item.stock > 0 ? <ReserveButton inventoryId={item.id} /> : null}
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  )
}
