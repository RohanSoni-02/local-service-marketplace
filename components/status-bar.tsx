"use client"

import { Signal, Wifi, BatteryFull } from "lucide-react"
import { useEffect, useState } from "react"

export function StatusBar() {
  const [time, setTime] = useState("9:41")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", ""),
      )
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-6 text-foreground">
      <span className="font-heading text-[15px] font-semibold tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
        <Wifi className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
        <BatteryFull className="size-4" strokeWidth={2} aria-hidden="true" />
      </div>
    </div>
  )
}
