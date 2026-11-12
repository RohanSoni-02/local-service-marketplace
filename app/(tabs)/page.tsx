import Link from "next/link"
import { ArrowRight, ChevronRight, MapPin, Search } from "lucide-react"
import { categories, serviceArea } from "@/lib/catalog"
import { formatDateTime } from "@/lib/format"
import { getUser } from "@/lib/server/auth"
import { getActiveBooking } from "@/lib/server/bookings"
import { listShops } from "@/lib/server/shops"
import { CategoryIcon } from "@/components/category-icon"
import { AutoRefresh } from "@/components/auto-refresh"
import { ShopExplorer } from "@/components/shop-explorer"
import { ShopPhoto } from "@/components/shop-photo"
import { BookingStatusPill } from "@/components/status"
import { buttonClass } from "@/components/ui/button-class"
import { Avatar } from "@/components/ui/misc"

export default async function HomePage() {
  const user = await getUser()
  const [shops, active] = await Promise.all([listShops(), user ? getActiveBooking(user.id) : null])
  const nearby = shops.filter((shop) => shop.distanceKm <= serviceArea.radiusKm).slice(0, 8)
  const firstName = user?.name.split(/\s+/)[0]

  return (
    <div className="flex flex-col gap-7 pb-4 pt-4">
      <header className="flex items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <MapPin className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-xs text-ink-soft">Serving</p>
            <p className="truncate text-sm font-semibold text-ink">
              {serviceArea.name}, {user?.pincode || serviceArea.pincode}
            </p>
          </div>
        </div>
        {user ? (
          <Link href="/profile" aria-label="Your profile" className="pressable rounded-full">
            <Avatar name={user.name} />
          </Link>
        ) : (
          <Link href="/login" className={buttonClass({ variant: "outline", size: "sm" })}>
            Sign in
          </Link>
        )}
      </header>

      <div className="flex animate-rise flex-col gap-4 px-4">
        <h1 className="text-[30px] font-bold leading-[1.08] text-ink">
          {firstName ? (
            <>
              What needs fixing,
              <br />
              {firstName}?
            </>
          ) : (
            <>
              Trusted local help,
              <br />
              minutes away.
            </>
          )}
        </h1>

        <form action="/search" role="search" className="relative">
          <label htmlFor="home-search" className="sr-only">
            Search parts in nearby shops
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-soft"
            aria-hidden="true"
          />
          <input
            id="home-search"
            name="q"
            type="search"
            enterKeyHint="search"
            placeholder="Find a part nearby — pipe joint, MCB…"
            className="h-[52px] w-full rounded-2xl border border-line-strong bg-surface pl-11 pr-4 text-[15px] text-ink shadow-card placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12"
          />
        </form>
      </div>

      {active ? (
        <Link
          href={`/booking/${active.booking.id}`}
          className="pressable mx-4 flex animate-rise items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card"
        >
          <AutoRefresh intervalMs={5000} />
          <ShopPhoto shop={active.shop} sizes="48px" className="size-12 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink">{active.booking.issueType}</p>
            <p className="truncate text-[13px] text-ink-soft">
              {active.booking.status === "broadcasting"
                ? "Waiting for shops to respond"
                : active.booking.status === "accepted" && active.booking.scheduledAt
                  ? `${active.shop.name} · ${formatDateTime(active.booking.scheduledAt)}`
                  : active.shop.name}
            </p>
          </div>
          <BookingStatusPill status={active.booking.status} />
          <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
        </Link>
      ) : null}

      <section className="flex flex-col gap-3.5 px-4">
        <h2 className="text-[17px] font-semibold text-ink">Services</h2>
        <ul className="stagger grid grid-cols-4 gap-x-2 gap-y-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={`/category/${category.id}`} className="group flex flex-col items-center gap-2">
                <span className="flex aspect-square w-full max-w-[4.5rem] items-center justify-center rounded-[20px] border border-line bg-surface text-brand transition-[transform,border-color,background-color] duration-200 ease-out-quint group-hover:border-brand/30 group-hover:bg-brand-soft group-active:scale-95">
                  <CategoryIcon categoryId={category.id} className="size-[26px]" />
                </span>
                <span className="text-center text-[12.5px] font-medium leading-tight text-ink">{category.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Link
        href="/category/tool-rental"
        className="pressable group relative mx-4 overflow-hidden rounded-3xl bg-brand-deep p-5 text-on-brand"
      >
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -right-10 -top-12 size-52 text-on-brand/[0.07]"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="100" cy="100" r="34" fill="currentColor" />
        </svg>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-marigold">Tool rental</p>
        <h2 className="mt-1.5 max-w-[16ch] text-[22px] font-semibold leading-tight">Need the tool, not the technician?</h2>
        <p className="mt-1.5 max-w-[30ch] text-sm text-on-brand/75">
          Drills, ladders and tile cutters by the day. Deposit back on return.
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
          Browse tools
          <ArrowRight
            className="size-4 transition-transform duration-200 ease-out-quint group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </Link>

      <ShopExplorer
        title="Shops near you"
        caption={`Within ${serviceArea.radiusKm} km of ${serviceArea.name}`}
        shops={nearby}
        layout="carousel"
      />
    </div>
  )
}
