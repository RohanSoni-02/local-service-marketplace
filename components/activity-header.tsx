import { SegmentedLinks } from "@/components/ui/segmented"

export function ActivityHeader({ current }: { current: "/bookings" | "/rentals" }) {
  return (
    <header className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-[28px] font-bold leading-none">Activity</h1>
      <SegmentedLinks
        label="Activity type"
        current={current}
        options={[
          { href: "/bookings", label: "Service visits" },
          { href: "/rentals", label: "Rentals & holds" },
        ]}
      />
    </header>
  )
}
