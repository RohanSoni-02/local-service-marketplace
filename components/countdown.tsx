"use client"

import { useEffect, useState } from "react"

function format(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

/** Ticks down to an absolute time. `initialMs` comes from the server so the first paint matches. */
export function Countdown({ until, initialMs, className }: { until: number; initialMs: number; className?: string }) {
  const [remaining, setRemaining] = useState(initialMs)
  useEffect(() => {
    const id = setInterval(() => setRemaining(until - Date.now()), 500)
    return () => clearInterval(id)
  }, [until])
  return (
    <time className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(remaining)}
    </time>
  )
}
