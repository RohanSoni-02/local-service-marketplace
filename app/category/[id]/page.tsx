import { notFound } from "next/navigation"
import { FlowHeader } from "@/components/flow-header"
import { ShopCard } from "@/components/shop-card"
import { CategoryIcon } from "@/components/category-icon"
import CategoryPageContent from "./CategoryPageContent"
import { getCategory, getShopsByCategory } from "@/lib/mock-data"

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = getCategory(id)
  if (!category) notFound()

  const shopList = [...getShopsByCategory(id)].sort((a, b) => b.rating - a.rating)

  return (
    <CategoryPageContent category={category} shopList={shopList} />
  )
}
