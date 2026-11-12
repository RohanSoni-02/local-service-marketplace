import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-9", className)} aria-hidden="true">
      <rect width="64" height="64" rx="16" className="fill-brand" />
      <path
        d="M32 13c-9.4 0-17 7.3-17 16.4 0 11.800 13.300 20.900 16 22.700a1.800 1.800 0 0 0 2 0C35.700 50.300 49 41.200 49 29.400 49 20.300 41.400 13 32 13Z"
        className="fill-on-brand"
      />
      <path
        d="M24.500 30.200 32 23.500l7.500 6.700V37a1.500 1.500 0 0 1-1.500 1.500h-3.500v-5h-5v5H26a1.500 1.500 0 0 1-1.500-1.500v-6.800Z"
        className="fill-brand"
      />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="font-display text-[22px] font-bold tracking-tight text-ink">Thikana</span>
    </span>
  )
}
