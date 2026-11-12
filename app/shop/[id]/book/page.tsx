import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getIssueTypes } from "@/lib/catalog"
import { formatDateTime } from "@/lib/format"
import { requireUser } from "@/lib/server/auth"
import { getShop } from "@/lib/server/shops"
import { upcomingSlots } from "@/lib/slots"
import { BookingForm } from "@/components/booking-form"
import { TopBar } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Request a visit" }

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser(`/shop/${id}/book`)
  const shop = await getShop(id)
  if (!shop) notFound()

  return (
    <>
      <TopBar title="Request a visit" subtitle={shop.name} fallback={`/shop/${id}`} />
      <BookingForm
        shop={{ id: shop.id, name: shop.name, visitFee: shop.visitFee }}
        issueTypes={getIssueTypes(shop.categoryId)}
        slots={upcomingSlots().map((slot) => ({ value: slot.toISOString(), label: formatDateTime(slot) }))}
        defaultAddress={[user.address, user.pincode].filter(Boolean).join(", ")}
      />
    </>
  )
}
