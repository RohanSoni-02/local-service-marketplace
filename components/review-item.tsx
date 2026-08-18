import type { Review } from "@/lib/mock-data"
import { StarRating } from "@/components/star-rating"

export function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border py-3.5 last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] font-semibold text-foreground">{review.author}</span>
        <span className="text-[11.5px] text-muted-foreground">{review.daysAgo}d ago</span>
      </div>
      <StarRating rating={review.rating} size="sm" />
      <p className="text-[13px] leading-relaxed text-muted-foreground">{review.text}</p>
    </div>
  )
}
