"use client"

import { useState } from "react"
import { MapPin, ChevronDown } from "lucide-react"

export function LocationLangBar() {
  const [lang, setLang] = useState<"EN" | "HI">("EN")

  return (
    <div className="flex items-center justify-between gap-3 px-4 pt-1">
      <button
        type="button"
        className="flex min-w-0 items-center gap-1.5 rounded-full py-1 text-left active:opacity-70"
        aria-label="Change delivery location"
      >
        <MapPin className="size-4 shrink-0 text-primary" strokeWidth={2.25} aria-hidden="true" />
        <span className="min-w-0 truncate text-[13px] text-muted-foreground">
          Delivering to <span className="font-semibold text-foreground">110024, Lajpat Nagar</span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      <div
        role="group"
        aria-label="Language"
        className="flex shrink-0 items-center rounded-full bg-secondary p-0.5 text-[11px] font-semibold"
      >
        <button
          type="button"
          onClick={() => setLang("EN")}
          aria-pressed={lang === "EN"}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === "EN" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLang("HI")}
          aria-pressed={lang === "HI"}
          className={`rounded-full px-2.5 py-1 font-[family-name:var(--font-devanagari)] transition-colors ${
            lang === "HI" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          हिं
        </button>
      </div>
    </div>
  )
}
