"use client"

import { Store, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type ShopPoint = {
  id: string
  name: string
  angle: number
  distance: number
}

const points: ShopPoint[] = [
  { id: "shop-1", name: "Sharma Plumbing", angle: -35, distance: 0.78 },
  { id: "shop-2", name: "Bright Spark", angle: 40, distance: 0.62 },
  { id: "shop-3", name: "Kumar Carpentry", angle: 150, distance: 0.7 },
  { id: "shop-4", name: "CoolAir AC", angle: -140, distance: 0.85 },
]

export function BroadcastRadar({
  acceptedShopId,
  broadcasting,
}: {
  acceptedShopId?: string
  broadcasting: boolean
}) {
  const radius = 110

  return (
    <div className="relative mx-auto flex size-[260px] items-center justify-center">
      {broadcasting && (
        <>
          <span className="absolute size-[100px] rounded-full border-2 border-primary/40 animate-ping [animation-duration:1.8s]" />
          <span className="absolute size-[170px] rounded-full border-2 border-primary/25 animate-ping [animation-duration:1.8s] [animation-delay:0.3s]" />
          <span className="absolute size-[240px] rounded-full border-2 border-primary/15 animate-ping [animation-duration:1.8s] [animation-delay:0.6s]" />
        </>
      )}

      <span className="absolute size-[100px] rounded-full border border-border" />
      <span className="absolute size-[170px] rounded-full border border-border" />
      <span className="absolute size-[240px] rounded-full border border-border" />

      <div className="absolute z-10 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
        <span className="text-[10px] font-bold leading-none">YOU</span>
      </div>

      {points.map((point) => {
        const rad = (point.angle * Math.PI) / 180
        const x = Math.cos(rad) * radius * point.distance
        const y = Math.sin(rad) * radius * point.distance
        const isAccepted = point.id === acceptedShopId
        const isRejected = Boolean(acceptedShopId) && !isAccepted

        return (
          <div
            key={point.id}
            className="absolute flex flex-col items-center gap-1 transition-all duration-500"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              opacity: isRejected ? 0.35 : 1,
            }}
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-500",
                isAccepted
                  ? "scale-110 border-primary bg-primary text-primary-foreground"
                  : "border-card bg-card text-primary",
              )}
            >
              {isAccepted ? (
                <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <Store className="size-4" aria-hidden="true" />
              )}
            </div>
            {isAccepted && (
              <span className="whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                Accepted!
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
