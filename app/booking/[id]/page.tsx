import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/server/auth"
import { ACTIVE_STATUSES, getBooking } from "@/lib/server/bookings"
import { AutoRefresh } from "@/components/auto-refresh"
import { BookingView } from "@/components/booking-view"
import { TopBar } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Your request" }

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser(`/booking/${id}`)
  const detail = await getBooking(id, user.id)
  if (!detail) notFound()
  const live = (ACTIVE_STATUSES as readonly string[]).includes(detail.booking.status)

  return (
    <>
      <TopBar title={detail.booking.issueType} subtitle={`Requested via ${detail.requestedShop.name}`} fallback="/bookings" />
      {live ? <AutoRefresh intervalMs={2500} /> : null}
      <BookingView detail={detail} />
    </>
  )
}
