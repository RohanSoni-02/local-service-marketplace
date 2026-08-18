import type React from "react"
import { BottomNav } from "@/components/bottom-nav"

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <BottomNav />
    </div>
  )
}
