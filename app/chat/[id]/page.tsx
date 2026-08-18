import { notFound } from "next/navigation"
import { chatMessages, getShop } from "@/lib/mock-data"
import { ChatThread } from "@/components/chat-thread"

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shop = getShop(id)
  if (!shop) notFound()

  const initialMessages = chatMessages[id] ?? [
    {
      id: "seed-1",
      shopId: id,
      sender: "shop" as const,
      text: `Hi! This is ${shop.name}. How can we help you today?`,
      time: "Just now",
    },
  ]

  return <ChatThread shop={shop} initialMessages={initialMessages} />
}
