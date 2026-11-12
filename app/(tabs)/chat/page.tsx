import type { Metadata } from "next"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { formatDay, formatTime } from "@/lib/format"
import { requireUser } from "@/lib/server/auth"
import { listThreads } from "@/lib/server/chat"
import { ShopPhoto } from "@/components/shop-photo"
import { EmptyState } from "@/components/ui/misc"

export const metadata: Metadata = { title: "Chats" }

export default async function ChatListPage() {
  const user = await requireUser("/chat")
  const threads = await listThreads(user.id)
  const now = new Date()

  return (
    <>
      <header className="px-4 pt-6">
        <h1 className="text-[28px] font-bold leading-none">Chats</h1>
      </header>
      {threads.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          body="Message a shop from its page, or chat opens automatically once a shop accepts your request."
        />
      ) : (
        <ul className="stagger mt-3 divide-y divide-line">
          {threads.map(({ shop, last }) => (
            <li key={shop.id}>
              <Link href={`/chat/${shop.id}`} className="flex items-center gap-3.5 px-4 py-3.5 transition-colors duration-150 hover:bg-sunken active:bg-sunken">
                <ShopPhoto shop={shop} sizes="48px" className="size-12 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="truncate font-sans text-[15px] font-semibold tracking-normal text-ink">{shop.name}</h2>
                    <time className="shrink-0 text-xs text-ink-soft">
                      {formatDay(last.createdAt, now) === "Today" ? formatTime(last.createdAt) : formatDay(last.createdAt, now)}
                    </time>
                  </div>
                  <p className="truncate text-sm text-ink-soft">
                    {last.sender === "user" ? "You: " : ""}
                    {last.text}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
