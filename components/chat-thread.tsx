"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Send, Phone } from "lucide-react"
import type { ChatMessage, Shop } from "@/lib/mock-data"
import { FlowHeader } from "@/components/flow-header"
import { cn } from "@/lib/utils"

const autoReplies = [
  "Sure, let me check and get back to you shortly.",
  "Yes, that works. We'll have someone reach out.",
  "Thanks for the details, noted!",
]

export function ChatThread({ shop, initialMessages }: { shop: Shop; initialMessages: ChatMessage[] }) {
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const replyIndex = useRef(0)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  function sendMessage() {
    const text = input.trim()
    if (!text) return
    const now = new Date()
    const time = now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
    setMessages((prev) => [
      ...prev,
      { id: `local-${prev.length}`, shopId: shop.id, sender: "user", text, time },
    ])
    setInput("")

    setTimeout(() => {
      const reply = autoReplies[replyIndex.current % autoReplies.length]
      replyIndex.current += 1
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${prev.length}`,
          shopId: shop.id,
          sender: "shop",
          text: reply,
          time: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
        },
      ])
    }, 1400)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative flex shrink-0 items-center border-b border-border bg-card">
        <FlowHeader
          title={shop.name}
          subtitle={`${shop.distanceKm} km away`}
          onClose={() => router.push("/chat")}
          variant="close"
          className="flex-1 border-0"
        />
        <button
          type="button"
          aria-label="Call shop"
          className="absolute right-4 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary active:opacity-70"
        >
          <Phone className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex flex-col gap-1", m.sender === "user" ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {m.text}
              </div>
              <span className="px-1 text-[10.5px] text-muted-foreground">{m.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-card px-3 py-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 active:opacity-90"
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  )
}
