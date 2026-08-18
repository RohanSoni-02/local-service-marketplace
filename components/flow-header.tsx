"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function FlowHeader({
  title,
  subtitle,
  variant = "back",
  onClose,
  transparent,
  className,
}: {
  title: string
  subtitle?: string
  variant?: "back" | "close"
  onClose?: () => void
  transparent?: boolean
  className?: string
}) {
  const router = useRouter()

  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-3 px-4 py-3.5",
        transparent ? "bg-transparent" : "border-b border-border bg-card",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => (onClose ? onClose() : router.back())}
        aria-label={variant === "close" ? "Close" : "Go back"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground active:opacity-70"
      >
        {variant === "close" ? (
          <X className="size-[18px]" strokeWidth={2.25} aria-hidden="true" />
        ) : (
          <ArrowLeft className="size-[18px]" strokeWidth={2.25} aria-hidden="true" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-heading text-[17px] font-semibold leading-tight text-foreground">{title}</h1>
        {subtitle ? <p className="truncate text-[12.5px] leading-tight text-muted-foreground">{subtitle}</p> : null}
      </div>
    </header>
  )
}
