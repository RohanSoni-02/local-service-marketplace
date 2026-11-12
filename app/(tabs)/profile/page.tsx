import type { Metadata } from "next"
import Link from "next/link"
import { Building2, ChevronRight, CircleHelp, ClipboardList, HandHeart, LogOut, MapPin, ShieldCheck } from "lucide-react"
import { signOut } from "@/lib/actions/auth"
import { formatPhone } from "@/lib/format"
import { requireUser } from "@/lib/server/auth"
import { getMembership } from "@/lib/server/society"
import { EditProfile } from "@/components/edit-profile"
import { SubmitButton } from "@/components/ui/button"
import { Avatar } from "@/components/ui/misc"

export const metadata: Metadata = { title: "Profile" }

export default async function ProfilePage() {
  const user = await requireUser("/profile")
  const membership = await getMembership(user.id)

  const links = [
    { href: "/bookings", icon: ClipboardList, label: "Your activity", detail: "Visits, rentals and holds" },
    { href: "/lending", icon: HandHeart, label: "Lend and borrow", detail: "Your listings and neighbour loans" },
    {
      href: "/society",
      icon: Building2,
      label: "Society",
      detail: membership ? `${membership.society.name} · Flat ${membership.member.flat}` : "Link your flat for group rates",
    },
    { href: "/help#verification", icon: ShieldCheck, label: "How shops are verified", detail: "What the badges mean" },
    { href: "/help", icon: CircleHelp, label: "Help", detail: "Payments, cancellations, deposits" },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <header className="flex animate-rise items-center gap-4">
        <Avatar name={user.name} className="size-16 text-xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold leading-tight">{user.name}</h1>
          <p className="tabular text-sm text-ink-soft">{formatPhone(user.phone)}</p>
        </div>
        <EditProfile user={{ name: user.name, address: user.address, pincode: user.pincode }} />
      </header>

      <div className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
        <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-ink">Home address</p>
          <p className="text-ink-soft">
            {user.address}, {user.pincode}
          </p>
        </div>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
        {links.map(({ href, icon: Icon, label, detail }) => (
          <li key={href} className="border-b border-line last:border-b-0">
            <Link href={href} className="flex items-center gap-3.5 px-4 py-3.5 transition-colors duration-150 hover:bg-sunken active:bg-sunken">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink">{label}</span>
                <span className="block truncate text-[13px] text-ink-soft">{detail}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <form action={signOut}>
        <SubmitButton variant="secondary" size="lg" className="w-full">
          <LogOut aria-hidden="true" />
          Sign out
        </SubmitButton>
      </form>
    </div>
  )
}
