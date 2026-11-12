"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Re-fetches the current route's server data on an interval while the tab is
 * visible. Used on screens that wait on the other party (offers, job status,
 * chat replies).
 */
export function AutoRefresh({ intervalMs = 3000 }: { intervalMs?: number }) {
  const router = useRouter()
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh()
    }
    const id = setInterval(tick, intervalMs)
    document.addEventListener("visibilitychange", tick)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [router, intervalMs])
  return null
}
