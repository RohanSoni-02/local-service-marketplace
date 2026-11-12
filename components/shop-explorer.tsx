"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { List, Map as MapIcon } from "lucide-react"
import type { ShopListing } from "@/lib/server/shops"
import { ShopCard, ShopRow } from "@/components/shop-card"
import { Segmented } from "@/components/ui/segmented"

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-2xl bg-sunken" />,
})

/** A set of shops the visitor can flip between a list and a map. */
export function ShopExplorer({
  title,
  caption,
  shops,
  layout,
}: {
  title: string
  caption?: string
  shops: ShopListing[]
  layout: "carousel" | "list"
}) {
  const [view, setView] = useState<"list" | "map">("list")

  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex items-end justify-between gap-3 px-4">
        <div>
          <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
          {caption ? <p className="text-[13px] text-ink-soft">{caption}</p> : null}
        </div>
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
        <div className="px-4">
          <MapView shops={shops} />
        </div>
      ) : layout === "carousel" ? (
        <div className="no-scrollbar stagger flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
          {shops.map((shop, index) => (
            <ShopCard key={shop.id} shop={shop} priority={index < 2} />
          ))}
        </div>
      ) : (
        <div className="stagger flex flex-col gap-3 px-4">
          {shops.map((shop, index) => (
            <ShopRow key={shop.id} shop={shop} priority={index < 3} />
          ))}
        </div>
      )}
    </section>
  )
}
