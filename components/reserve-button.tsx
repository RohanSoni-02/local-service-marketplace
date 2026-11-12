"use client"

import { reserveItem } from "@/lib/actions/stock"
import { useAction } from "@/components/use-action"
import { Button } from "@/components/ui/button"

export function ReserveButton({ inventoryId }: { inventoryId: string }) {
  const [pending, run] = useAction()
  return (
    <Button variant="outline" pending={pending} onClick={() => run(() => reserveItem(inventoryId))}>
      Hold
    </Button>
  )
}
