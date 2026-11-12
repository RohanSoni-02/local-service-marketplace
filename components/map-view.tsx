"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { serviceArea } from "@/lib/catalog"
import type { ShopListing } from "@/lib/server/shops"
import { ShopRow } from "@/components/shop-card"

function pin(selected: boolean) {
  const size = selected ? 34 : 26
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="filter:drop-shadow(0 2px 3px rgb(0 0 0 / .3));overflow:visible">
      <path d="M12 23s8-6.200 8-12.700A8 8 0 0 0 4 10.300C4 16.800 12 23 12 23Z" fill="${selected ? "var(--color-marigold)" : "var(--color-brand)"}" stroke="var(--color-surface)" stroke-width="1.5"/>
      <circle cx="12" cy="10.300" r="2.800" fill="var(--color-surface)"/>
    </svg>`,
  })
}

const you = L.divIcon({
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:var(--color-ink);border:3px solid var(--color-surface);box-shadow:0 0 0 6px oklch(0.22 0.025 165 / .15)"></span>`,
})

export default function MapView({ shops }: { shops: ShopListing[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef(new Map<string, L.Marker>())
  const [selectedId, setSelectedId] = useState<string | null>(shops[0]?.id ?? null)
  const selected = shops.find((shop) => shop.id === selectedId) ?? null

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const markers = markersRef.current

    const map = L.map(container, { scrollWheelZoom: false, zoomControl: false, attributionControl: true })
    L.control.zoom({ position: "bottomright" }).addTo(map)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const home: L.LatLngTuple = [serviceArea.latitude, serviceArea.longitude]
    L.marker(home, { icon: you, interactive: false, keyboard: false }).addTo(map)

    for (const shop of shops) {
      const marker = L.marker([shop.latitude, shop.longitude], { icon: pin(false), title: shop.name, alt: shop.name })
        .addTo(map)
        .on("click", () => setSelectedId(shop.id))
      markers.set(shop.id, marker)
    }

    const bounds = L.latLngBounds([home, ...shops.map((shop): L.LatLngTuple => [shop.latitude, shop.longitude])])
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 })

    return () => {
      markers.clear()
      map.remove()
    }
  }, [shops])

  useEffect(() => {
    for (const [id, marker] of markersRef.current) {
      marker.setIcon(pin(id === selectedId)).setZIndexOffset(id === selectedId ? 1000 : 0)
    }
  }, [selectedId, shops])

  return (
    <div className="flex animate-fade flex-col gap-3">
      <div
        ref={containerRef}
        role="application"
        aria-label="Map of nearby shops"
        className="isolate h-72 overflow-hidden rounded-2xl border border-line"
      />
      {selected ? (
        <div key={selected.id} className="animate-rise">
          <ShopRow shop={selected} />
        </div>
      ) : null}
    </div>
  )
}
