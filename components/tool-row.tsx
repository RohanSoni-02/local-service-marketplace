import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { formatINR } from "@/lib/format"
import type { ToolListing } from "@/lib/server/shops"
import { Pill } from "@/components/ui/misc"
import { cn } from "@/lib/utils"

export function ToolPhoto({ tool, className, sizes }: { tool: { photo: string | null }; className?: string; sizes: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-xl bg-white", className)}>
      {tool.photo ? <Image src={tool.photo} alt="" fill sizes={sizes} className="object-contain p-1" /> : null}
    </div>
  )
}

export function ToolRow({ tool }: { tool: ToolListing }) {
  const body = (
    <>
      <ToolPhoto tool={tool} sizes="72px" className="size-[72px] border border-line" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold text-ink">{tool.name}</h3>
        <p className="text-[13px] text-ink-soft">
          {tool.category} · {tool.condition}
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          <span className="tabular text-[15px] font-semibold text-ink">{formatINR(tool.dailyPrice)}</span> / day
        </p>
      </div>
      {tool.available ? (
        <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
      ) : (
        <Pill>Rented out</Pill>
      )}
    </>
  )
  const frame = "flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3"
  return tool.available ? (
    <Link href={`/shop/${tool.shopId}/rent/${tool.id}`} className={cn(frame, "pressable hover:border-line-strong")}>
      {body}
    </Link>
  ) : (
    <div className={cn(frame, "opacity-70")}>{body}</div>
  )
}
