import { notFound } from "next/navigation"
import { getShop, getTool } from "@/lib/mock-data"
import { RentalFlow } from "@/components/rental-flow"

export default async function RentToolPage({ params }: { params: Promise<{ id: string; toolId: string }> }) {
  const { id, toolId } = await params
  const shop = getShop(id)
  const tool = getTool(toolId)
  if (!shop || !tool || tool.shopId !== shop.id) notFound()

  return <RentalFlow tool={tool} shop={shop} />
}
