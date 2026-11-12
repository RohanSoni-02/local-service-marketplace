"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Option<T extends string> = { value: T; label: ReactNode }

const track = "grid auto-cols-fr grid-flow-col rounded-xl bg-sunken p-1"
const item =
  "flex h-9 items-center justify-center gap-1.5 rounded-[9px] px-3 text-[13.5px] font-semibold text-ink-soft " +
  "transition-[background-color,color,box-shadow] duration-200 ease-out " +
  "aria-[current=true]:bg-surface aria-[current=true]:text-ink aria-[current=true]:shadow-card " +
  "aria-pressed:bg-surface aria-pressed:text-ink aria-pressed:shadow-card [&_svg]:size-4"

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  label: string
  className?: string
}) {
  return (
    <div role="group" aria-label={label} className={cn(track, className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={item}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Same control, but each segment is a route. */
export function SegmentedLinks({
  current,
  options,
  label,
  className,
}: {
  current: string
  options: { href: string; label: ReactNode }[]
  label: string
  className?: string
}) {
  return (
    <nav aria-label={label} className={cn(track, className)}>
      {options.map((option) => (
        <Link key={option.href} href={option.href} aria-current={option.href === current ? "true" : undefined} className={item}>
          {option.label}
        </Link>
      ))}
    </nav>
  )
}
