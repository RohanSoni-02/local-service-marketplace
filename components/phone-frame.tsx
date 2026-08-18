import type React from "react"
import { StatusBar } from "@/components/status-bar"

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[oklch(0.16_0.02_165)] p-0 sm:p-6">
      <div className="relative flex h-svh w-full max-w-[430px] flex-col overflow-hidden bg-background sm:h-[860px] sm:rounded-[2.75rem] sm:border-[6px] sm:border-[oklch(0.1_0.01_165)] sm:shadow-2xl">
        <div
          className="pointer-events-none absolute left-1/2 top-2 z-20 hidden h-6 w-28 -translate-x-1/2 rounded-full bg-[oklch(0.1_0.01_165)] sm:block"
          aria-hidden="true"
        />
        <StatusBar />
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
