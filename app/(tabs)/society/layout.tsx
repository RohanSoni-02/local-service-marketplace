import React from "react"

export default function SocietyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  )
}