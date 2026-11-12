import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Star } from "lucide-react"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-surface", className)}>{children}</div>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-semibold text-ink">{children}</h2>
      {action}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="flex animate-rise flex-col items-center px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-[30ch] text-sm text-ink-soft">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-brand font-display text-sm font-semibold text-on-brand",
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("tabular inline-flex items-center gap-1 text-[13px] font-semibold text-ink", className)}>
      <Star className="size-3.5 fill-marigold text-marigold" aria-hidden="true" />
      <span aria-label={`Rated ${value.toFixed(1)} out of 5`}>{value.toFixed(1)}</span>
      {count != null ? <span className="font-normal text-ink-soft">({count})</span> : null}
    </span>
  )
}

/** A labelled value on one line, used in receipts and summaries. */
export function Row({ label, children, strong }: { label: ReactNode; children: ReactNode; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 text-sm", strong && "text-[15px] font-semibold")}>
      <span className={strong ? "text-ink" : "text-ink-soft"}>{label}</span>
      <span className="tabular text-right font-medium text-ink">{children}</span>
    </div>
  )
}

const tones = {
  neutral: "bg-sunken text-ink-soft",
  brand: "bg-brand-soft text-brand-deep",
  marigold: "bg-marigold-soft text-marigold-ink",
  danger: "bg-danger-soft text-danger",
  solid: "bg-brand text-on-brand",
}

export function Pill({
  tone = "neutral",
  icon: Icon,
  children,
  className,
}: {
  tone?: keyof typeof tones
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
