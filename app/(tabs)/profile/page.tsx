import {
  UserRound,
  MapPin,
  Wallet,
  Bell,
  Globe,
  ShieldCheck,
  CircleHelp,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuGroups = [
  {
    title: "Account",
    items: [
      { icon: MapPin, label: "Saved addresses" },
      { icon: Wallet, label: "Payment methods · UPI" },
      { icon: Bell, label: "Notifications" },
      { icon: Globe, label: "Language · English" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: ShieldCheck, label: "Verified shops policy" },
      { icon: CircleHelp, label: "Help center" },
      { icon: FileText, label: "Terms & privacy" },
    ],
  },
]

export default function ProfilePage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3.5 border-b border-border bg-card px-4 py-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <UserRound className="size-7" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-heading text-[17px] font-bold text-foreground">Ananya Iyer</h1>
            <p className="text-[12.5px] text-muted-foreground">+91 98765 43210</p>
            <p className="text-[12px] text-muted-foreground">Lajpat Nagar, New Delhi · 110024</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-4 py-5">
          {menuGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <span className="px-1 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </span>
              <div className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
                {group.items.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 text-left active:bg-secondary/60",
                        i !== group.items.length - 1 && "border-b border-border/70",
                      )}
                    >
                      <Icon className="size-[18px] shrink-0 text-primary" aria-hidden="true" />
                      <span className="flex-1 text-[13.5px] font-medium text-foreground">{item.label}</span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-[13.5px] font-semibold text-destructive active:opacity-80"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </button>

          <p className="pb-2 text-center text-[11.5px] text-muted-foreground">Thikana v1.0.0</p>
        </div>
      </div>
    </div>
  )
}

