import { notFound } from "next/navigation"
import { getShop } from "@/lib/mock-data"
import { BookingFlow } from "@/components/booking-flow"

export default async function BookServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shop = getShop(id)
  if (!shop) notFound()

  return <BookingFlow shop={shop} />
}
