import Image from "next/image"
import { Drill, CheckCircle2 } from "lucide-react"
import { rentalHistory, getShop, getTool } from "@/lib/mock-data"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function RentalsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card px-4 pb-3 pt-4">
        <h1 className="font-heading text-[19px] font-bold text-foreground">My Rentals</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {rentalHistory.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Drill className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-[13.5px] font-medium text-foreground">No rentals yet</p>
            <p className="text-[12.5px] text-muted-foreground">Rented tools will show up here.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rentalHistory.map((rental, index) => {
              const shop = getShop(rental.shopId)
              const tool = getTool(rental.toolId)
              if (!shop || !tool) return null
              const isActive = rental.status === "active"
              return (
                <li
                  key={rental.id}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-sm ring-1 ring-border"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={tool.photo || "/placeholder.svg"}
                      alt={tool.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[13.5px] font-semibold text-foreground">{tool.name}</span>
                    <span className="text-[12px] text-muted-foreground">
                      {shop.name} · {rental.days} day{rental.days > 1 ? "s" : ""}
                    </span>
                    <span className="text-[11.5px] text-muted-foreground">
                      {isActive ? `Due ${rental.dueAt}` : `Returned ${rental.returnedAt}`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        isActive ? "bg-accent/25 text-accent-foreground" : "bg-primary/10 text-primary",
                      )}
                    >
                      {!isActive && <CheckCircle2 className="size-3" aria-hidden="true" />}
                      {isActive ? "Active" : "Returned"}
                    </span>
                    <span className="text-[11.5px] font-semibold text-foreground">
                      {formatINR(rental.dailyPrice * rental.days)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
