import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/server/auth"
import { getShop, getTool } from "@/lib/server/shops"
import { RentalForm } from "@/components/rental-form"
import { TopBar } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Rent a tool" }

export default async function RentPage({ params }: { params: Promise<{ id: string; toolId: string }> }) {
  const { id, toolId } = await params
  await requireUser(`/shop/${id}/rent/${toolId}`)
  const [shop, tool] = await Promise.all([getShop(id), getTool(toolId)])
  if (!shop || !tool || tool.shopId !== shop.id) notFound()

  return (
    <>
      <TopBar title="Rent this tool" subtitle={shop.name} fallback={`/shop/${id}`} />
      <RentalForm tool={tool} shopName={shop.name} />
    </>
  )
}
