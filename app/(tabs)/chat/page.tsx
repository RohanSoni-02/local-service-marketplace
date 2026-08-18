import Link from "next/link"
import Image from "next/image"
import { chatMessages, getShop } from "@/lib/mock-data"
import { VerifiedBadge } from "@/components/verified-badge"

export default function ChatListPage() {
  const threads = Object.entries(chatMessages)
    .map(([shopId, messages]) => {
      const shop = getShop(shopId)
      const last = messages[messages.length - 1]
      return shop && last ? { shop, last } : null
    })
    .filter((t): t is { shop: NonNullable<ReturnType<typeof getShop>>; last: (typeof chatMessages)[string][number] } => t !== null)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card px-4 pb-3 pt-4">
        <h1 className="font-heading text-[19px] font-bold text-foreground">Chats</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="text-[13.5px] font-medium text-foreground">No conversations yet</p>
            <p className="text-[12.5px] text-muted-foreground">
              Chats with shops open automatically once you book a service.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {threads.map(({ shop, last }) => (
              <li key={shop.id} className="border-b border-border/70 last:border-0">
                <Link
                  href={`/chat/${shop.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/60"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    <Image src={shop.photo || "/placeholder.svg"} alt={shop.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13.5px] font-semibold text-foreground">{shop.name}</span>
                      <VerifiedBadge tier={shop.tier} compact />
                    </div>
                    <span className="truncate text-[12.5px] text-muted-foreground">
                      {last.sender === "user" ? "You: " : ""}
                      {last.text}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{last.time}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
