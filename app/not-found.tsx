import Link from "next/link"
import { Compass } from "lucide-react"
import { buttonClass } from "@/components/ui/button-class"
import { EmptyState } from "@/components/ui/misc"

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={Compass}
        title="We couldn't find that"
        body="The page may have moved, or the shop is no longer listed."
        action={
          <Link href="/" className={buttonClass()}>
            Back to home
          </Link>
        }
      />
    </main>
  )
}
