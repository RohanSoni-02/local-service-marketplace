"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ClipboardList, Drill, MessageCircle, UserRound, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/rentals", label: "Rentals", icon: Drill },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/society", label: "Society", icon: Building2 },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="shrink-0 border-t border-border bg-card px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5"
    >
      <ul className="flex items-stretch justify-between">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className="flex flex-col items-center gap-1 rounded-xl px-1 py-1.5"
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn("size-[22px]", active ? "text-primary" : "text-muted-foreground")}
                  strokeWidth={active ? 2.4 : 1.9}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "text-[11px] font-medium leading-none",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
