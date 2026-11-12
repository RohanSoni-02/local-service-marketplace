"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, ClipboardList, Home, MessageCircle, UserRound } from "lucide-react"

const tabs = [
  { href: "/", label: "Home", icon: Home, match: ["/"] },
  { href: "/bookings", label: "Activity", icon: ClipboardList, match: ["/bookings", "/rentals", "/lending"] },
  { href: "/society", label: "Society", icon: Building2, match: ["/society"] },
  { href: "/chat", label: "Chats", icon: MessageCircle, match: ["/chat"] },
  { href: "/profile", label: "Profile", icon: UserRound, match: ["/profile"] },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Primary"
      className="app-fixed bottom-0 z-30 border-t border-line bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5 px-2">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)))
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="group flex h-16 flex-col items-center justify-center gap-1 text-ink-soft aria-[current=page]:text-brand-deep"
              >
                <span className="flex h-7 w-14 items-center justify-center rounded-full transition-[background-color,transform] duration-200 ease-out-quint group-active:scale-90 group-aria-[current=page]:bg-brand-soft">
                  <Icon className="size-[21px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                </span>
                <span className="text-[11.5px] font-semibold leading-none">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
