"use client"

import { cancelReservation } from "@/lib/actions/stock"
import { useAction } from "@/components/use-action"
import { Button } from "@/components/ui/button"

export function CancelHoldButton({ reservationId }: { reservationId: string }) {
  const [pending, run] = useAction()
  return (
    <Button
      variant="ghost"
      className="self-center text-danger hover:bg-danger-soft hover:text-danger"
      pending={pending}
      onClick={() => run(() => cancelReservation(reservationId))}
    >
      Release this hold
    </Button>
  )
}
