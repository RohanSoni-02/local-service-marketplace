"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShieldCheck, MapPinned, PackageCheck, MessageCircle, ClipboardList, CircleCheck } from "lucide-react"
import type { Shop, Tool } from "@/lib/mock-data"
import { formatINR } from "@/lib/format"
import { FlowHeader } from "@/components/flow-header"
import { cn } from "@/lib/utils"

type Step = "details" | "confirmed" | "active"

export function RentalFlow({ tool, shop }: { tool: Tool; shop: Shop }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("details")
  const [days, setDays] = useState(2)

  const rentalCost = tool.dailyPrice * days
  const totalDue = rentalCost + tool.deposit

  if (step === "active") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <FlowHeader title="Active rental" subtitle={tool.name} variant="close" onClose={() => router.push("/")} />
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary p-5 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <PackageCheck className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-heading text-[15px] font-bold text-foreground">Picked up successfully</p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Your {days}-day rental is active. Return by the due date to get your deposit back.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-sm ring-1 ring-border">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image src={tool.photo || "/placeholder.svg"} alt={tool.name} fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[13.5px] font-semibold text-foreground">{tool.name}</span>
              <span className="text-[12px] text-muted-foreground">Rented from {shop.name}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Picked up</span>
              <span className="font-semibold text-foreground">Today, 11:20 AM</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Due back</span>
              <span className="font-semibold text-foreground">
                In {days} day{days > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Deposit held</span>
              <span className="font-semibold text-foreground">{formatINR(tool.deposit)}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href={`/chat/${shop.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 text-[12.5px] font-semibold text-foreground active:opacity-70"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Chat with shop
            </Link>
            <Link
              href="/rentals"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-[12.5px] font-semibold text-primary-foreground active:opacity-90"
            >
              <ClipboardList className="size-4" aria-hidden="true" />
              My rentals
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (step === "confirmed") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <FlowHeader title="Booking confirmed" subtitle={tool.name} variant="close" onClose={() => router.push("/")} />
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="flex flex-col items-center gap-2 pb-2 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CircleCheck className="size-7" aria-hidden="true" />
            </div>
            <p className="font-heading text-[16px] font-bold text-foreground">Reserved at {shop.name}</p>
            <p className="text-[13px] text-muted-foreground">
              Pick up the {tool.name.toLowerCase()} anytime during shop hours today.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-2.5 text-[13px] text-foreground">
              <MapPinned className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {shop.name} · {shop.distanceKm} km away
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Rental period</span>
              <span className="font-semibold text-foreground">
                {days} day{days > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Rental cost</span>
              <span className="font-semibold text-foreground">{formatINR(rentalCost)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Refundable deposit</span>
              <span className="font-semibold text-foreground">{formatINR(tool.deposit)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-border pt-2.5 text-[13.5px]">
              <span className="font-semibold text-foreground">Paid via UPI</span>
              <span className="font-bold text-foreground">{formatINR(totalDue)}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-border bg-card px-4 py-3">
          <button
            type="button"
            onClick={() => setStep("active")}
            className="w-full rounded-xl bg-primary py-3.5 text-center font-heading text-[14px] font-semibold text-primary-foreground active:opacity-90"
          >
            Confirm pickup
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <FlowHeader title="Rent this tool" subtitle={shop.name} />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-sm ring-1 ring-border">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            <Image src={tool.photo || "/placeholder.svg"} alt={tool.name} fill sizes="80px" className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-[14px] font-semibold text-foreground">{tool.name}</span>
            <span className="text-[12.5px] text-muted-foreground">{tool.category} · {tool.condition} condition</span>
            <span className="text-[13px] font-bold text-primary">{formatINR(tool.dailyPrice)}/day</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-foreground">Rental duration</span>
          <div className="flex items-center justify-between rounded-2xl bg-secondary p-3">
            <button
              type="button"
              onClick={() => setDays((d) => Math.max(1, d - 1))}
              aria-label="Decrease days"
              className="flex size-9 items-center justify-center rounded-full bg-card text-foreground shadow-sm active:opacity-70"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="font-heading text-[16px] font-bold text-foreground">
              {days} day{days > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => setDays((d) => Math.min(14, d + 1))}
              aria-label="Increase days"
              className="flex size-9 items-center justify-center rounded-full bg-card text-foreground shadow-sm active:opacity-70"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">
              {formatINR(tool.dailyPrice)} × {days} day{days > 1 ? "s" : ""}
            </span>
            <span className="font-semibold text-foreground">{formatINR(rentalCost)}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Refundable deposit</span>
            <span className="font-semibold text-foreground">{formatINR(tool.deposit)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2.5 text-[13.5px]">
            <span className="font-semibold text-foreground">Pay now</span>
            <span className="font-bold text-foreground">{formatINR(totalDue)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-secondary/60 p-3.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Your deposit of {formatINR(tool.deposit)} is fully refunded once the tool is returned in good
            condition.
          </p>
        </div>
      </div>
      <div className="shrink-0 border-t border-border bg-card px-4 py-3">
        <button
          type="button"
          onClick={() => setStep("confirmed")}
          className={cn(
            "w-full rounded-xl bg-primary py-3.5 text-center font-heading text-[14px] font-semibold text-primary-foreground active:opacity-90",
          )}
        >
          Pay {formatINR(totalDue)} via UPI
        </button>
      </div>
    </div>
  )
}
