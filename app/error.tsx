"use client"

import { useEffect } from "react"
import { CloudOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/misc"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={CloudOff}
        title="Something went wrong"
        body="That didn't load properly. Your bookings and rentals are safe."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </main>
  )
}
