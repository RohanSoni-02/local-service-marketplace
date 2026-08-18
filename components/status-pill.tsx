import { cn } from "@/lib/utils"
import type { BookingStatus } from "@/lib/mock-data"

const styles: Record<BookingStatus, string> = {
  broadcasting: "bg-accent/25 text-accent-foreground",
  accepted: "bg-accent/25 text-accent-foreground",
  on_the_way: "bg-accent/25 text-accent-foreground",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-muted text-muted-foreground",
}

const labels: Record<BookingStatus, string> = {
  broadcasting: "Broadcasting",
  accepted: "Accepted",
  on_the_way: "On the way",
  completed: "Completed",
  cancelled: "Cancelled",
}

export function StatusPill({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", styles[status])}>
      {labels[status]}
    </span>
  )
}
