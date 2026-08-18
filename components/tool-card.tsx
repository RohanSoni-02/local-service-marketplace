import Link from "next/link"
import Image from "next/image"
import type { Tool } from "@/lib/mock-data"
import { formatINR } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

export function ToolCard({ tool, shopId }: { tool: Tool; shopId: string }) {
  return (
    <Link
      href={`/shop/${shopId}/rent/${tool.id}`}
      className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border active:opacity-90"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image src={tool.photo || "/placeholder.svg"} alt={tool.name} fill sizes="64px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate text-[13.5px] font-semibold text-foreground">{tool.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-primary">{formatINR(tool.dailyPrice)}/day</span>
          <Badge variant="secondary" className="text-[10.5px]">
            {tool.condition}
          </Badge>
        </div>
        <span className="text-[11.5px] text-muted-foreground">
          Deposit {formatINR(tool.deposit)} · refundable
        </span>
      </div>
    </Link>
  )
}
