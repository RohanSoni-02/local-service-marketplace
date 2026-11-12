"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import type { ActionResult } from "@/lib/actions/types"

/**
 * Runs a server action inside a transition and surfaces a failure as a toast.
 * Actions that redirect on success never resolve with a value, hence `void`.
 */
export function useAction() {
  const [pending, startTransition] = useTransition()
  const run = (action: () => Promise<ActionResult | void>, onSuccess?: () => void) => {
    startTransition(async () => {
      const result = await action()
      if (result && !result.ok) toast.error(result.error)
      else if (result) onSuccess?.()
    })
  }
  return [pending, run] as const
}
