import type { Metadata } from "next"
import { BadgeCheck, ShieldCheck, Sparkles } from "lucide-react"
import { TopBar } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Help" }

const tiers = [
  {
    icon: ShieldCheck,
    name: "Gold verified",
    tone: "bg-marigold-soft text-marigold-ink",
    body: "Identity and premises checked, 250+ completed jobs and a rating of 4.7 or higher.",
  },
  {
    icon: BadgeCheck,
    name: "Verified",
    tone: "bg-brand-soft text-brand-deep",
    body: "Identity and premises checked in person by the Thikana team.",
  },
  {
    icon: Sparkles,
    name: "New",
    tone: "bg-sunken text-ink-soft",
    body: "Recently joined. Documents received; the in-person check is still pending.",
  },
]

const faqs = [
  {
    q: "How do I pay?",
    a: "You pay the shop directly, by cash or UPI, once the job is done or when you collect a tool or part. Thikana doesn't take payment in the app.",
  },
  {
    q: "How do offers and counter-offers work?",
    a: "Your request goes to shops in that trade within 5 km. Each can send a price and arrival time. Accept one, or counter once with your own price; the shop either takes it or holds at its quote.",
  },
  {
    q: "Can I cancel a visit?",
    a: "Yes, any time before the technician sets out. Once they are on the way, call or message the shop.",
  },
  {
    q: "What happens to my rental deposit?",
    a: "The shop holds it while the tool is with you and returns it in full when the tool comes back in the condition you received it.",
  },
  {
    q: "How does the bond work when I borrow from a neighbour?",
    a: "You hand the owner the bond in cash or by UPI when you collect, and they enter your handover code to record that they hold it. When the item is back in the same condition the owner returns it in full. If something is damaged they can keep part of it, and must state the amount and reason, which you can see on the loan. Thikana records the bond but does not hold the money.",
  },
  {
    q: "How long is a part held for me?",
    a: "Two hours from when you tap Hold. After that it goes back on the shelf automatically.",
  },
]

export default function HelpPage() {
  return (
    <>
      <TopBar title="Help" fallback="/profile" />
      <main className="flex flex-col gap-8 px-4 pb-12 pt-6">
        <section id="verification" className="flex scroll-mt-20 flex-col gap-3">
          <h2 className="text-xl font-semibold">How shops are verified</h2>
          <ul className="flex flex-col gap-3">
            {tiers.map(({ icon: Icon, name, tone, body }) => (
              <li key={name} className="flex gap-3.5 rounded-2xl border border-line bg-surface p-4">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-sans text-[15px] font-semibold tracking-normal">{name}</h3>
                  <p className="text-sm text-ink-soft">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Common questions</h2>
          <div className="divide-y divide-line">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group py-4">
                <summary className="flex list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {q}
                  <span aria-hidden="true" className="text-xl font-normal leading-none text-ink-soft transition-transform duration-200 ease-out-quint group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
