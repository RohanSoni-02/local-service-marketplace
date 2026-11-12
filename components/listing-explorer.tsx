"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { List, Map as MapIcon, Store } from "lucide-react"
import { formatDistance, formatINR, plural } from "@/lib/format"
import type { ListingView } from "@/lib/server/listings"
import type { ShopListing } from "@/lib/server/shops"
import { ListingCard, ListingRow } from "@/components/listing-bits"
import { ToolPhoto } from "@/components/tool-row"
import { Segmented } from "@/components/ui/segmented"

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-2xl bg-sunken" />,
})

export type ShopToolResult = {
  tool: { id: string; shopId: string; name: string; photo: string | null; dailyPrice: number; deposit: number }
  shop: ShopListing
}

function ShopToolRow({ tool, shop }: ShopToolResult) {
  return (
    <Link
      href={`/shop/${shop.id}/rent/${tool.id}`}
      className="pressable flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3 hover:border-line-strong"
    >
      <ToolPhoto tool={tool} sizes="72px" className="size-[72px] border border-line" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-sans text-[15px] font-semibold tracking-normal text-ink">{tool.name}</h3>
        <p className="flex items-center gap-1.5 truncate text-[13px] text-ink-soft">
          <Store className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
          {shop.name} · {formatDistance(shop.distanceKm)}
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          <span className="tabular text-[15px] font-semibold text-ink">{formatINR(tool.dailyPrice)}</span> / day ·{" "}
          {formatINR(tool.deposit)} deposit
        </p>
      </div>
    </Link>
  )
}

/** Search results from neighbours and shops, as a grid or as pins on a map. */
export function ListingExplorer({ listings, shopTools }: { listings: ListingView[]; shopTools: ShopToolResult[] }) {
  const [view, setView] = useState<"list" | "map">("list")
  const [selectedId, setSelectedId] = useState<string | null>(listings[0]?.id ?? shopTools[0]?.tool.id ?? null)
  const selectedListing = listings.find((listing) => listing.id === selectedId)
  const selectedTool = shopTools.find(({ tool }) => tool.id === selectedId)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-ink-soft">
          {plural(listings.length + shopTools.length, "item")} nearby, closest first
        </p>
        <Segmented
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: "list", label: <><List aria-hidden="true" /> List</> },
            { value: "map", label: <><MapIcon aria-hidden="true" /> Map</> },
          ]}
        />
      </div>

      {view === "map" ? (
        <div className="flex flex-col gap-3">
          <MapView
            points={[
              ...listings.map((listing) => ({
                id: listing.id,
                latitude: listing.latitude,
                longitude: listing.longitude,
                label: listing.title,
                kind: "neighbour" as const,
              })),
              ...shopTools.map(({ tool, shop }) => ({
                id: tool.id,
                latitude: shop.latitude,
                longitude: shop.longitude,
                label: `${tool.name} at ${shop.name}`,
                kind: "shop" as const,
              })),
            ]}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <p className="flex items-center gap-4 text-xs text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-ink" /> Neighbours
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-brand" /> Shops
            </span>
            <span className="ml-auto">Pins are approximate</span>
          </p>
          <div key={selectedId} className="animate-rise">
            {selectedListing ? <ListingRow listing={selectedListing} /> : null}
            {selectedTool ? <ShopToolRow {...selectedTool} /> : null}
          </div>
        </div>
      ) : (
        <>
          {listings.length > 0 ? (
            <ul className="stagger grid grid-cols-2 gap-3">
              {listings.map((listing, index) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} priority={index < 4} />
                </li>
              ))}
            </ul>
          ) : null}
          {shopTools.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-[17px] font-semibold">Also at shops nearby</h2>
              <ul className="flex flex-col gap-3">
                {shopTools.map((result) => (
                  <li key={result.tool.id}>
                    <ShopToolRow {...result} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
