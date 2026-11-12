import { serviceArea } from "@/lib/catalog"

type Point = { latitude: number; longitude: number }

/** Great-circle distance in kilometres, rounded to 100 m. */
export function distanceKm(a: Point, b: Point = serviceArea) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)) * 10) / 10
}

export function directionsUrl(point: Point) {
  return `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`
}
