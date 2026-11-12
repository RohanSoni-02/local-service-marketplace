import { cn } from "@/lib/utils"

export type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger"
export type Size = "sm" | "md" | "lg"

const variants: Record<Variant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-deep",
  secondary: "bg-sunken text-ink hover:bg-line",
  outline: "border border-line-strong bg-surface text-ink hover:bg-sunken",
  ghost: "text-ink-soft hover:bg-sunken hover:text-ink",
  danger: "bg-danger-soft text-danger hover:bg-danger/15",
}

const sizes: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-[10px] px-3 text-[13px]",
  md: "h-11 gap-2 rounded-xl px-4 text-sm",
  lg: "h-[52px] gap-2 rounded-[14px] px-5 text-[15px]",
}

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "pressable inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-semibold",
    "disabled:opacity-45 [&_svg]:size-[1.15em] [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  )
}
