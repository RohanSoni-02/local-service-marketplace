"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { serviceArea } from "@/lib/catalog"

export type MapPoint = {
  id: string
  latitude: number
  longitude: number
  label: string
  /** Shops and neighbours get different pin colours. */
  kind?: "shop" | "neighbour"
}

function pin(kind: MapPoint["kind"], selected: boolean) {
  const size = selected ? 34 : 26
  const fill = selected ? "var(--color-marigold)" : kind === "neighbour" ? "var(--color-ink)" : "var(--color-brand)"
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="filter:drop-shadow(0 2px 3px rgb(0 0 0 / .3));overflow:visible">
      <path d="M12 23s8-6.200 8-12.700A8 8 0 0 0 4 10.300C4 16.800 12 23 12 23Z" fill="${fill}" stroke="var(--color-surface)" stroke-width="1.5"/>
      <circle cx="12" cy="10.300" r="2.800" fill="var(--color-surface)"/>
    </svg>`,
  })
}

const you = L.divIcon({
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:var(--color-brand);border:3px solid var(--color-surface);box-shadow:0 0 0 6px oklch(0.37 0.075 165 / .18)"></span>`,
})

/** A map of pins around the service area. The parent owns selection and renders the detail card. */
export default function MapView({
  points,
  selectedId,
  onSelect,
}: {
  points: MapPoint[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef(new Map<string, { marker: L.Marker; kind: MapPoint["kind"] }>())
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Rebuild only when the set of pins changes, not on every parent render.
  const signature = points.map((point) => `${point.id}:${point.latitude}:${point.longitude}`).join("|")
  const pointsRef = useRef(points)
  useEffect(() => {
    pointsRef.current = points
  }, [points])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const markers = markersRef.current
    const current = pointsRef.current

    const map = L.map(container, { scrollWheelZoom: false, zoomControl: false })
    L.control.zoom({ position: "bottomright" }).addTo(map)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const home: L.LatLngTuple = [serviceArea.latitude, serviceArea.longitude]
    L.marker(home, { icon: you, interactive: false, keyboard: false }).addTo(map)

    for (const point of current) {
      const marker = L.marker([point.latitude, point.longitude], {
        icon: pin(point.kind, false),
        title: point.label,
        alt: point.label,
      })
        .addTo(map)
        .on("click", () => onSelectRef.current(point.id))
      markers.set(point.id, { marker, kind: point.kind })
    }

    const bounds = L.latLngBounds([home, ...current.map((point): L.LatLngTuple => [point.latitude, point.longitude])])
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 })

    return () => {
      markers.clear()
      map.remove()
    }
  }, [signature])

  useEffect(() => {
    for (const [id, { marker, kind }] of markersRef.current) {
      marker.setIcon(pin(kind, id === selectedId)).setZIndexOffset(id === selectedId ? 1000 : 0)
    }
  }, [selectedId, signature])

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Map of nearby results"
      className="isolate h-72 animate-fade overflow-hidden rounded-2xl border border-line"
    />
  )
}
