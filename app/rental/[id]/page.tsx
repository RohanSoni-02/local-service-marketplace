import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/server/auth"
import { getRental } from "@/lib/server/rentals"
import { RentalView } from "@/components/rental-view"
import { TopBar } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Your rental" }

export default async function RentalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser(`/rental/${id}`)
  const detail = await getRental(id, user.id)
  if (!detail) notFound()

  return (
    <>
      <TopBar title={detail.tool.name} subtitle={detail.shop.name} fallback="/rentals" />
      <RentalView {...detail} />
    </>
  )
}
