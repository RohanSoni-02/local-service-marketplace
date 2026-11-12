"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Goes back through history when the visitor navigated here inside the app,
 * and to a sensible parent route when they landed directly.
 */
export function BackButton({ fallback, className }: { fallback: string; className?: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => {
        const cameFromApp = document.referrer.startsWith(window.location.origin) || window.history.length > 2
        if (cameFromApp) router.back()
        else router.push(fallback)
      }}
      className={cn(
        "pressable -ml-1.5 flex size-10 shrink-0 items-center justify-center rounded-full text-ink hover:bg-sunken",
        className,
      )}
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
    </button>
  )
}

export function TopBar({
  title,
  subtitle,
  fallback,
  action,
}: {
  title: string
  subtitle?: string
  fallback: string
  action?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-background px-4">
      <BackButton fallback={fallback} />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-semibold leading-tight text-ink">{title}</h1>
        {subtitle ? <p className="truncate text-[13px] leading-tight text-ink-soft">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  )
}

/** Primary action pinned to the bottom of a flow screen. Pair with `pb-28` on the page. */
export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "app-fixed bottom-0 z-30 border-t border-line bg-background px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3",
        className,
      )}
    >
      {children}
    </div>
  )
}
