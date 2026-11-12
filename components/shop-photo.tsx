import Image from "next/image"
import { CategoryIcon } from "@/components/category-icon"
import { cn } from "@/lib/utils"

/**
 * A shop's storefront photo. Shops that haven't uploaded one get a quiet
 * category tile rather than a stock placeholder.
 */
export function ShopPhoto({
  shop,
  sizes,
  priority,
  className,
}: {
  shop: { name: string; photo: string | null; categoryId: string }
  sizes: string
  priority?: boolean
  className?: string
}) {
  return (
    <div className={cn("relative overflow-hidden bg-sunken", className)}>
      {shop.photo ? (
        <Image src={shop.photo} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center bg-brand-soft text-brand/70">
          <CategoryIcon categoryId={shop.categoryId} className="size-[38%] max-h-12 max-w-12" strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}
