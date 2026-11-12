import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Phone } from "lucide-react"
import { formatDay, formatTime } from "@/lib/format"
import { requireUser } from "@/lib/server/auth"
import { getThread } from "@/lib/server/chat"
import { getShop } from "@/lib/server/shops"
import { AutoRefresh } from "@/components/auto-refresh"
import { ChatThread } from "@/components/chat-thread"
import { TopBar } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Chat" }

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser(`/chat/${id}`)
  const shop = await getShop(id)
  if (!shop) notFound()
  const thread = await getThread(user.id, id)
  const now = new Date()

  return (
    <>
      <TopBar
        title={shop.name}
        subtitle={shop.hours}
        fallback="/chat"
        action={
          <a
            href={`tel:+91${shop.phone}`}
            aria-label={`Call ${shop.name}`}
            className="pressable flex size-10 items-center justify-center rounded-full text-brand-deep hover:bg-sunken"
          >
            <Phone className="size-[18px]" aria-hidden="true" />
          </a>
        }
      />
      <AutoRefresh intervalMs={3000} />
      <ChatThread
        shopId={shop.id}
        shopName={shop.name}
        messages={thread.map((message) => ({
          id: message.id,
          sender: message.sender,
          text: message.text,
          time: formatTime(message.createdAt),
          day: formatDay(message.createdAt, now),
        }))}
      />
    </>
  )
}
