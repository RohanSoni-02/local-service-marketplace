"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const icon = L.divIcon({
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  html: `<svg viewBox="0 0 24 24" width="36" height="36" style="filter:drop-shadow(0 2px 3px rgb(0 0 0 / .3));overflow:visible">
    <path d="M12 23s8-6.200 8-12.700A8 8 0 0 0 4 10.300C4 16.800 12 23 12 23Z" fill="var(--color-brand)" stroke="var(--color-surface)" stroke-width="1.5"/>
    <circle cx="12" cy="10.300" r="2.800" fill="var(--color-surface)"/>
  </svg>`,
})

type Point = { latitude: number; longitude: number }

/** A small map with one draggable pin. Tap anywhere or drag the pin to set the spot. */
export default function LocationPicker({ value, onChange }: { value: Point; onChange: (point: Point) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ map: L.Map; marker: L.Marker } | null>(null)
  const onChangeRef = useRef(onChange)
  const initial = useRef(value)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const start: L.LatLngTuple = [initial.current.latitude, initial.current.longitude]
    const map = L.map(container, { scrollWheelZoom: false, zoomControl: false }).setView(start, 15)
    L.control.zoom({ position: "bottomright" }).addTo(map)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    const marker = L.marker(start, { icon, draggable: true, keyboard: true, title: "Pickup spot" }).addTo(map)
    const emit = () => {
      const { lat, lng } = marker.getLatLng()
      onChangeRef.current({ latitude: lat, longitude: lng })
    }
    marker.on("dragend", emit)
    map.on("click", (event) => {
      marker.setLatLng(event.latlng)
      emit()
    })
    mapRef.current = { map, marker }
    return () => {
      mapRef.current = null
      map.remove()
    }
  }, [])

  // Follow changes made outside the map, such as "use my location".
  useEffect(() => {
    const current = mapRef.current
    if (!current) return
    const { lat, lng } = current.marker.getLatLng()
    if (Math.abs(lat - value.latitude) < 1e-6 && Math.abs(lng - value.longitude) < 1e-6) return
    current.marker.setLatLng([value.latitude, value.longitude])
    current.map.setView([value.latitude, value.longitude], 16)
  }, [value.latitude, value.longitude])

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Pickup location. Tap the map or drag the pin."
      className="isolate h-52 overflow-hidden rounded-2xl border border-line"
    />
  )
}
