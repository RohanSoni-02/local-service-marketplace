"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Camera,
  Zap,
  CalendarClock,
  MessageCircle,
  ClipboardList,
  X,
  Timer,
  Trash2,
  Loader,
  Check,
  MessageSquare,
  ImagePlus,
} from "lucide-react"
import type { Shop } from "@/lib/mock-data"
import { getIssueTypes } from "@/lib/issue-types"
import { FlowHeader } from "@/components/flow-header"
import { BroadcastRadar } from "@/components/broadcast-radar"
import { StatusTimeline, type TimelineStepState } from "@/components/status-timeline"
import { cn } from "@/lib/utils"
import { shops } from "@/lib/mock-data"

type Step = "form" | "confirm" | "offers" | "status"
type BookingStatus = "broadcasting" | "accepted" | "on_the_way" | "completed"

const scheduleSlots = ["Today, 4:00 PM", "Today, 6:30 PM", "Tomorrow, 10:00 AM", "Tomorrow, 2:00 PM"]

export function BookingFlow({ shop }: { shop: Shop }) {
  const router = useRouter()
  const issueTypes = getIssueTypes(shop.categoryId)

  const [step, setStep] = useState<Step>("form")
  const [issueType, setIssueType] = useState(issueTypes[0])
  const [description, setDescription] = useState("")
  const [photoAdded, setPhotoAdded] = useState(false)
  const [mode, setMode] = useState<"Instant" | "Scheduled">("Instant")
  const [slot, setSlot] = useState(scheduleSlots[0])
  // NEW: Negotiation fields
  const [budget, setBudget] = useState("") // e.g., "₹300-500"
  const [allowNegotiation, setAllowNegotiation] = useState(true)

  const [status, setStatus] = useState<BookingStatus>("broadcasting")
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Offer screen state
  const [offers, setOffers] = useState<Array<{
    id: string
    shop: Shop
    offeredPrice: number // in ₹
    eta: string // e.g., "15 min"
    counterPrice?: number // last counter offered by user
    status: "pending" | "countered" | "accepted" | "declined" // from user perspective
  }>>([])
  const [countdownSeconds, setCountdownSeconds] = useState(5 * 60) // 5 minutes
  const [counterModal, setCounterModal] = useState<{
    shopId: string
    price: number
  } | null>(null)
  const [countersSent, setCountersSent] = useState<Map<string, number>>(new Map()) // shopId -> counter price

  // Accepted shop name for status header when coming from offers
  const [acceptedShopName, setAcceptedShopName] = useState<string | null>(null)

  useEffect(() => {
    if (step !== "status") return
    setStatus("broadcasting")
    timers.current.push(
      setTimeout(() => setStatus("accepted"), 2600),
      setTimeout(() => setStatus("on_the_way"), 5600),
      setTimeout(() => setStatus("completed"), 9600),
    )
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [step])

  // Countdown timer for offers screen
  useEffect(() => {
    if (step !== "offers") return
    if (countdownSeconds === 0) return
    const id = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [step, countdownSeconds])

  // Generate mock offers when entering offers step
  useEffect(() => {
    if (step !== "offers") return
    // Create 2-3 mock offers from other shops
    const otherShops = shops.filter((s) => s.id !== shop.id).slice(0, 3)
    const mockOffers: Array<{
      id: string
      shop: Shop
      offeredPrice: number
      eta: string
      counterPrice?: number
      status: "pending"
    }> = otherShops.map((s, idx) => {
      const basePrice = 300 + idx * 50 // ₹300, ₹350, ₹400
      const offeredPrice = basePrice + Math.floor(Math.random() * 50) // some variance
      const eta = `${10 + idx * 5} min`
      return {
        id: `${shop.id}-offer-${s.id}`,
        shop: s,
        offeredPrice,
        eta,
        status: "pending",
      }
    })
    setOffers(mockOffers)
    // Start with 5 minute countdown
    setCountdownSeconds(5 * 60)
  }, [step])

  const canContinue = description.trim().length > 0

  // Helper functions
  const handleAcceptOffer = (offerId: string) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === offerId
          ? { ...offer, status: "accepted" }
          : { ...offer, status: "declined" }
      )
    )
    // Find accepted offer to navigate
    const accepted = offers.find((o) => o.id === offerId)
    if (accepted) {
      // Navigate to tracking after a short delay
      setTimeout(() => {
        navigateToTracking(accepted.shop)
      }, 1500)
    }
  }

  const handleDeclineOffer = (offerId: string) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === offerId ? { ...offer, status: "declined" } : offer
      )
    )
  }

  const openCounterModal = (offerId: string, currentPrice: number) => {
    // Find the shop for this offer
    const offer = offers.find((o) => o.id === offerId)
    setCounterModal({
      shopId: offer?.shop.id ?? "",
      price: currentPrice,
    })
  }

  const handleCounterOffer = (shopId: string, counterPrice: number) => {
    // Record that we sent a counter
    setCountersSent((prev) => new Map(prev.set(shopId, counterPrice)))
    // Update offer status to countered
    setOffers((prev) =>
      prev.map((offer) =>
        offer.shop.id === shopId
          ? { ...offer, status: "countered", counterPrice }
          : offer
      )
    )
    // Simulate shop response after a delay
    const responseTime = Math.random() > 0.5 ? 2000 : 4000 // 50% accept, 50% hold firm
    setTimeout(() => {
      // Determine if shop accepts counter or holds firm
      const shopAccepts = Math.random() > 0.5 // 50% chance
      if (shopAccepts) {
        // Shop accepts our counter
        setOffers((prev) =>
          prev.map((offer) =>
            offer.shop.id === shopId
              ? { ...offer, status: "accepted", offeredPrice: counterPrice }
              : offer
          )
        )
        // Navigate to tracking
        const acceptedShop = offers.find((o) => o.shop.id === shopId)?.shop
        if (acceptedShop) {
          setTimeout(() => {
            navigateToTracking(acceptedShop)
          }, 1000)
        }
      } else {
        // Shop holds firm, revert to pending (user can only accept/decline original offer)
        setOffers((prev) =>
          prev.map((offer) =>
            offer.shop.id === shopId
              ? {
                  ...offer,
                  status: "pending",
                  counterPrice: undefined,
                }
              : offer
          )
        )
        // Update countersSent to reflect that counter was rejected (we keep it for UI maybe)
        // For simplicity, we just keep the counter in map but UI shows pending again.
      }
    }, responseTime)
  }

  const navigateToTracking = (acceptedShop: Shop) => {
    // Go to status step with accepted state
    setStep("status")
    setAcceptedShopName(acceptedShop.name)
    // Immediately jump to accepted status (skip broadcasting)
    setStatus("accepted")
  }

  // Offer icon component
  function OfferIcon({ categoryId }: { categoryId: string }) {
    let Icon;
    switch (categoryId) {
      case 'plumber':
        Icon = Zap;
        break;
      case 'electrician':
        Icon = Zap;
        break;
      case 'carpenter':
        Icon = CalendarClock;
        break;
      case 'ac-repair':
        Icon = Timer;
        break;
      case 'hardware':
        Icon = MessageCircle;
        break;
      case 'tool-rental':
        Icon = ClipboardList;
        break;
      case 'painter':
        Icon = Camera;
        break;
      case 'appliance':
        Icon = MessageSquare;
        break;
      default:
        Icon = MessageCircle;
    }
    return <Icon className="size-5" aria-hidden="true" />;
  }

  // STATUS STEP RENDERING (shared)
  if (step === "status") {
    const displayShopName = acceptedShopName ?? shop.name
    const timelineSteps: { label: string; description?: string; state: TimelineStepState }[] = [
      {
        label: "Sent to 4 shops nearby",
        description: "Broadcasting your request within 5 km",
        state: status === "broadcasting" ? "active" : "done",
      },
      {
        label: `Accepted by ${displayShopName}`,
        description:
          status === "accepted" || status === "on_the_way" || status === "completed"
            ? "Technician assigned"
            : undefined,
        state:
          status === "broadcasting"
            ? "upcoming"
            : status === "accepted"
              ? "active"
              : "done",
      },
      {
        label: "On the way",
        description:
          status === "on_the_way"
            ? "Arriving in about 15 minutes"
            : undefined,
        state:
          status === "broadcasting" || status === "accepted"
            ? "upcoming"
            : status === "on_the_way"
              ? "active"
              : "done",
      },
      {
        label: "Completed",
        description: status === "completed" ? "Job marked done by shop" : undefined,
        state: status === "completed" ? "done" : "upcoming",
      },
    ]

    return (
      <div className="flex h-full flex-col overflow-hidden">
        <FlowHeader title="Request status" subtitle={issueType} variant="close" onClose={() => router.push("/")} />
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {status === "broadcasting" || status === "accepted" ? (
            <div className="flex flex-col items-center gap-2 pb-2">
              <BroadcastRadar
                broadcasting={status === "broadcasting"}
                acceptedShopId={status === "accepted" ? shop.id : undefined}
              />
              <p className="text-center text-[13px] font-medium text-muted-foreground">
                {status === "broadcasting"
                  ? "Sending your request to shops within 5 km..."
                  : `${displayShopName} accepted your request!`}
              </p>
            </div>
          ) : null}

          <div className={cn("rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border", status !== "broadcasting" && status !== "accepted" ? "" : "mt-2")}>
            <StatusTimeline steps={timelineSteps} />
          </div>

          {status === "completed" && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-secondary p-4">
              <p className="text-[13.5px] font-semibold text-foreground">Job completed by {displayShopName}</p>
              <p className="text-[12.5px] text-muted-foreground">
                Total charged: <span className="font-semibold text-foreground">₹350</span> · paid via UPI
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/chat/${shop.id}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 text-[12.5px] font-semibold text-foreground active:opacity-70"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Chat
                </Link>
                <Link
                  href="/bookings"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-[12.5px] font-semibold text-primary-foreground active:opacity-90"
                >
                  <ClipboardList className="size-4" aria-hidden="true" />
                  View bookings
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <FlowHeader title="Confirm request" subtitle={shop.name} />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-muted-foreground">Issue</span>
              <span className="text-[13px] font-semibold text-foreground">{issueType}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12.5px] text-muted-foreground">Description</span>
              <p className="text-[13px] text-foreground">{description}</p>
            </div>
            {photoAdded && (
              <div className="flex items-center gap-2 text-[12.5px] text-primary">
                <ImagePlus className="size-4" aria-hidden="true" />1 photo attached
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-muted-foreground">When</span>
              <span className="text-[13px] font-semibold text-foreground">
                {mode === "Instant" ? "As soon as possible" : slot}
              </span>
            </div>
            {/* NEW: Budget and Negotiation toggles */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[12.5px] text-muted-foreground">Expected budget (optional)</span>
                <input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. ₹300-500"
                  className="rounded-2xl border border-border bg-card p-3 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[13px] font-medium text-foreground cursor-select">
                  <input
                    type="checkbox"
                    checked={allowNegotiation}
                    onChange={(e) => setAllowNegotiation(e.target.checked)}
                    className="rounded border-primary text-primary-foreground"
                  />
                  Allow shops to negotiate
                </label>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[12.5px] text-muted-foreground">
            This request will broadcast to {shop.name} and 3 nearby shops. Whichever accepts first will be assigned
            to your job.
          </p>
        </div>
        <div className="shrink-0 border-t border-border bg-card px-4 py-3">
          <button
            type="button"
            onClick={() => {
              if (allowNegotiation) {
                setStep("offers")
              } else {
                setStep("status")
              }
            }}
            className="w-full rounded-xl bg-primary py-3.5 text-center font-heading text-[14px] font-semibold text-primary-foreground active:opacity-90"
          >
            {allowNegotiation ? "Send request for offers" : "Send request (instant accept)"}
          </button>
        </div>
      </div>
    )
  }

  if (step === "offers") {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    return (
      <div className="flex h-full flex-col overflow-hidden">
        <FlowHeader title="Waiting for offers" subtitle={shop.name} variant="close" onClose={() => router.push("/")} />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Countdown timer */}
          <div className="mb-4 text-center text-[14px] font-semibold text-primary">
            Request open for offers — {formatTime(countdownSeconds)} remaining
          </div>

          {/* Offers list */}
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className={cn(
                  "rounded-2xl border border-border bg-card p-4",
                  offer.status === "accepted" && "border-primary bg-primary/5",
                  offer.status === "declined" && "border-dashed",
                  offer.status === "countered" && "border-secondary"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <OfferIcon categoryId={offer.shop.categoryId} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-[16px]">{offer.shop.name}</h3>
                      <div className="flex items-center gap-2 text-[12px]">
                        {offer.shop.tier === "Gold Verified" && (
                          <span className="flex items-center gap-1 rounded bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                            Verified
                          </span>
                        )}
                        {offer.shop.tier === "Verified" && (
                          <span className="flex items-center gap-1 rounded bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[13px] text-muted-foreground">{offer.eta} arrival</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[13px] font-semibold text-foreground">Offered price:</span>
                      <span className="text-[13px] text-foreground">₹{offer.offeredPrice}</span>
                      {offer.counterPrice !== undefined && (
                        <>
                          <span className="mx-2 text-[12px] text-muted-foreground">→</span>
                          <span className="text-[12px] text-muted-foreground">₹{offer.counterPrice}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex flex-col gap-2">
                  {offer.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="w-full rounded-xl bg-primary py-2 text-center font-medium text-[13px] text-primary-foreground"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => openCounterModal(offer.id, offer.offeredPrice)}
                        className="w-full rounded-xl border border-border py-2 text-center font-medium text-[13px] text-primary"
                      >
                        Counter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineOffer(offer.id)}
                        className="w-full rounded-xl bg-secondary text-secondary-foreground py-2 text-center font-medium text-[13px]"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {offer.status === "countered" && (
                    <div className="text-center text-[13px] text-muted-foreground">
                      Counter sent: ₹{offer.counterPrice} — waiting for shop response
                    </div>
                  )}
                  {offer.status === "accepted" && (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-foreground">Accepted</span>
                      <button
                        type="button"
                        onClick={() => navigateToTracking(offer.shop)}
                        className="text-primary text-[13px] font-medium underline"
                      >
                        Track
                      </button>
                    </div>
                  )}
                  {offer.status === "declined" && (
                    <span className="text-[13px] text-muted-foreground">Declined</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Counter modal */}
          {counterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="relative rounded-2xl bg-card p-6 w-full max-w-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-heading text-[16px]">Counter offer</h3>
                  <button
                    type="button"
                    onClick={() => setCounterModal(null)}
                    className="rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="mb-4 text-[13px] text-muted-foreground">
                  Your counter to{" "}
                  <strong className="text-foreground">
                    {offers.find((o) => o.shop.id === counterModal.shopId)?.shop.name ?? ""}
                  </strong>
                </p>
                <div className="mb-4">
                  <input
                    type="number"
                    min="50"
                    step="10"
                    placeholder="e.g. 350"
                    value={counterModal.price}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0
                      setCounterModal((prev) => (prev ? { ...prev, price: val } : null))
                    }}
                    className="rounded-2xl border border-border bg-card p-3 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCounterModal(null)
                    }}
                    className="rounded-xl bg-secondary py-2 px-4 text-[13px] font-medium text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCounterOffer(counterModal.shopId, counterModal.price)
                      setCounterModal(null)
                    }}
                    className="rounded-xl bg-primary py-2 px-4 text-[13px] font-medium text-primary-foreground"
                  >
                    Send counter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === "form") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <FlowHeader title="Book a service" subtitle={shop.name} />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-foreground">What&apos;s the issue?</span>
              <div className="flex flex-wrap gap-2">
                {issueTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIssueType(type)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                      issueType === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-foreground">Describe the problem</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Kitchen tap has been leaking since morning, water pooling under the sink..."
                rows={4}
                className="rounded-2xl border border-border bg-card p-3 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-foreground">Add a photo (optional)</span>
              {photoAdded ? (
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <ImagePlus className="size-5" aria-hidden="true" />
                  </div>
                  <span className="flex-1 text-[12.5px] text-muted-foreground">leak_photo.jpg attached</span>
                  <button
                    type="button"
                    onClick={() => setPhotoAdded(false)}
                    aria-label="Remove photo"
                    className="flex size-7 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhotoAdded(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-[13px] font-medium text-muted-foreground active:opacity-70"
                >
                  <Camera className="size-[18px]" aria-hidden="true" />
                  Take or upload a photo
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-foreground">When do you need this?</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("Instant")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-semibold",
                    mode === "Instant" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <Zap className="size-4" aria-hidden="true" />
                  Instant
                </button>
                <button
                  type="button"
                  onClick={() => setMode("Scheduled")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-semibold",
                    mode === "Scheduled"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <CalendarClock className="size-4" aria-hidden="true" />
                  Schedule
                </button>
              </div>
              {mode === "Scheduled" && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {scheduleSlots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[12px] font-medium",
                        slot === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-border bg-card px-4 py-3">
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep("confirm")}
            className="w-full rounded-xl bg-primary py-3.5 text-center font-heading text-[14px] font-semibold text-primary-foreground disabled:opacity-40 active:opacity-90"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  }