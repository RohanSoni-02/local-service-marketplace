"use client";

import Link from "next/link"
import { Search, Drill, ChevronRight, Camera } from "lucide-react"
import { LocationLangBar } from "@/components/location-lang-bar"
import { CategoryIcon } from "@/components/category-icon"
import { ShopCard } from "@/components/shop-card"
import dynamic from "next/dynamic"
import { categories, shops } from "@/lib/mock-data"
import { useState } from "react"
import { useRouter } from "next/navigation"

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false })

export default function HomePage() {
  const nearbyShops = [...shops].sort((a, b) => a.distanceKm - b.distanceKm)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6 pb-6 pt-3">
      <LocationLangBar />

      <div className="flex flex-col gap-1 px-4">
        <h1 className="font-heading text-[22px] font-bold leading-tight text-foreground">
          Trusted help, minutes away
        </h1>
        <p className="text-[13px] text-muted-foreground">Local shops verified by your neighbours</p>
      </div>

      <div className="px-4">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search for a part or tool (e.g., '15mm pipe joint', 'MCB switch')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-border bg-card text-[13.5px] shadow-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (searchTerm.trim()) {
                  router.push(`/stock-results?query=${encodeURIComponent(searchTerm)}`);
                }
              }}
              className="flex-1 items-center justify-center rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground shadow-sm"
            >
              Search
            </button>
            <button
              onClick={() => {
                const term = searchTerm.trim() || "15mm pipe joint";
                router.push(`/stock-results?query=${encodeURIComponent(term)}`);
              }}
              className="flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground shadow-sm"
            >
              <Camera className="size-[18px]" aria-hidden="true" />
              <span className="text-[13.5px]">Scan or upload photo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-heading text-[15px] font-semibold text-foreground">Categories</h2>
        </div>
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 px-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="flex flex-col items-center gap-1.5 active:opacity-70"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <CategoryIcon icon={category.icon} className="size-6" />
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-foreground">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/category/tool-rental"
        className="mx-4 flex items-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-primary-foreground shadow-sm"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
          <Drill className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-[14px] font-semibold leading-tight">Need a tool, not a job?</span>
          <span className="block text-[12px] leading-tight text-primary-foreground/80">
            Rent drills, ladders &amp; more by the day
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-heading text-[15px] font-semibold text-foreground">Nearby shops</h2>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-primary">within 5 km</span>
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            >
              {viewMode === 'map' ? (
                <span className="lucide-icon list-icon">⎇</span>
              ) : (
                <span className="lucide-icon map-icon">🗺️</span>
              )}
            </button>
          </div>
        </div>
        {viewMode === 'list' ? (
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {nearbyShops.map((shop, index) => (
              <ShopCard key={shop.id} shop={shop} variant="carousel" priority={index === 0} />
            ))}
          </div>
        ) : (
          <div className="px-4">
            <MapView shops={nearbyShops} />
          </div>
        )}
      </div>
    </div>
  )
}
