"use client"

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react"
import { ArrowUp } from "lucide-react"
import { toast } from "sonner"
import { sendMessage } from "@/lib/actions/chat"
import { cn } from "@/lib/utils"

type ChatMessage = { id: string; sender: "user" | "shop"; text: string; time: string; day: string; sending?: boolean }

export function ChatThread({ shopId, shopName, messages }: { shopId: string; shopName: string; messages: ChatMessage[] }) {
  const [draft, setDraft] = useState("")
  const [, startTransition] = useTransition()
  const [thread, addOptimistic] = useOptimistic(messages, (current, text: string) => [
    ...current,
    { id: `sending-${current.length}`, sender: "user" as const, text, time: "Sending…", day: "Today", sending: true },
  ])
  const endRef = useRef<HTMLDivElement>(null)
  const count = thread.length

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [count])

  function send() {
    const text = draft.trim()
    if (!text) return
    setDraft("")
    startTransition(async () => {
      addOptimistic(text)
      const result = await sendMessage(shopId, text)
      if (!result.ok) {
        toast.error(result.error)
        setDraft(text)
      }
    })
  }

  return (
    <>
      <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col justify-end gap-1 px-4 pb-24 pt-5">
        {thread.length === 0 ? (
          <p className="mx-auto max-w-[28ch] pb-10 text-center text-sm text-ink-soft">
            Ask {shopName} about availability, pricing or parts before you book.
          </p>
        ) : null}
        {thread.map((message, index) => {
          const previous = thread[index - 1]
          const mine = message.sender === "user"
          const grouped = previous?.sender === message.sender && previous.day === message.day
          return (
            <div key={message.id} className="contents">
              {previous?.day !== message.day ? (
                <p className="py-3 text-center text-xs font-medium text-ink-faint">{message.day}</p>
              ) : null}
              <div className={cn("flex flex-col", mine ? "items-end" : "items-start", grouped ? "mt-0.5" : "mt-2.5")}>
                <p
                  className={cn(
                    "max-w-[80%] animate-rise whitespace-pre-wrap break-words px-3.5 py-2.5 text-[15px] leading-snug [animation-duration:0.3s]",
                    mine
                      ? "rounded-[20px] rounded-br-md bg-brand text-on-brand"
                      : "rounded-[20px] rounded-bl-md bg-sunken text-ink",
                    message.sending && "opacity-70",
                  )}
                >
                  {message.text}
                </p>
                {thread[index + 1]?.sender !== message.sender || thread[index + 1]?.day !== message.day ? (
                  <span className="mt-1 px-1 text-[11px] text-ink-faint">{message.time}</span>
                ) : null}
              </div>
            </div>
          )
        })}
        <div ref={endRef} className="h-px scroll-mb-24" />
      </main>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
        className="app-fixed bottom-0 z-30 flex items-end gap-2 border-t border-line bg-background px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3"
      >
        <label htmlFor="message" className="sr-only">
          Message {shopName}
        </label>
        <input
          id="message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={1000}
          autoComplete="off"
          enterKeyHint="send"
          placeholder="Message"
          className="h-12 flex-1 rounded-full border border-line-strong bg-surface px-4.5 text-[15px] placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!draft.trim()}
          className="pressable flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand hover:bg-brand-deep disabled:bg-sunken disabled:text-ink-faint"
        >
          <ArrowUp className="size-5" strokeWidth={2.4} aria-hidden="true" />
        </button>
      </form>
    </>
  )
}
